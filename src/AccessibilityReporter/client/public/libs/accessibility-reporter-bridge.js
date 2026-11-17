/*
 * Accessibility Reporter bridge script.
 *
 * You normally don't need to reference this file directly - use @Html.AccessibilityReporterScript()
 * (Razor sites) or the small inline loader snippet (any other frontend) described in the
 * "Testing sites on a different domain" section of the package README. Either of those only loads
 * this file while Accessibility Reporter is actually running a test; this script also only does
 * anything when it detects that same condition itself (via window.name, set below), so even if it's
 * referenced directly via a plain <script src> tag, it stays inert for ordinary visits.
 *
 * Why this is needed at all: running an accessibility test normally means Accessibility Reporter
 * injects axe-core directly into the page being tested. Browsers only allow that for same-origin
 * pages, so for a genuinely different domain this script runs the test itself instead and reports
 * the result back over postMessage, which - unlike direct DOM access - is designed to work across
 * origins.
 *
 * If you do reference this file directly rather than via the loader snippet: don't load it through
 * a tag manager, a consent-gated loader, or with `defer`/`async` pointed at a delayed execution
 * path - it needs to run promptly as the page loads so it can announce itself before Accessibility
 * Reporter's own wait times out.
 */
(function (window, document) {
	// Must be read synchronously, at top-level script execution - it is null inside any callback.
	var scriptEl = document.currentScript;

	// Only ever active for the iframe Accessibility Reporter itself creates to run a test (which
	// sets this before navigating) - on a real visit this is never set, so everything below is
	// skipped entirely.
	if (window.name !== 'accessibility-reporter-bridge-activate') return;

	// window.AR_BRIDGE_ORIGIN is an escape hatch for the rare case this script is loaded in a way
	// where document.currentScript isn't available (e.g. as a dynamically-injected/module script).
	// This is only the origin this script's own assets (axe-core) are served from - it is NOT the
	// backoffice/parent's origin, which this script has no reliable way to know in advance (that's
	// the whole reason a bridge is needed). Do not use it to target or validate postMessage traffic
	// with window.parent - see the comments below.
	var assetOrigin = window.AR_BRIDGE_ORIGIN || (scriptEl && scriptEl.src ? new URL(scriptEl.src).origin : null);

	if (!assetOrigin) {
		console.error('[AccessibilityReporter] bridge could not determine an origin to load axe-core from - set window.AR_BRIDGE_ORIGIN before this script runs if it is not loaded as a plain <script src> tag.');
		return;
	}

	function respond(payload, nonce) {
		var message = {};
		for (var key in payload) {
			if (Object.prototype.hasOwnProperty.call(payload, key)) {
				message[key] = payload[key];
			}
		}
		message.nonce = nonce;
		// '*' because this script cannot know the parent's real origin (it may differ per install,
		// per environment, or even per request in a multi-domain setup) - safe here because the
		// parent (accessibility-reporter.service.ts) independently verifies the *sender's* origin
		// against the target URL it navigated this iframe to before trusting anything in the message.
		window.parent.postMessage(message, '*');
	}

	// Keep in sync with run-tests.js and AR_MAX_ANIMATION_WAIT_MS in accessibility-reporter.service.ts.
	var MAX_ANIMATION_WAIT_MS = 5000;

	function wait(ms) {
		return new Promise(function (resolve) { setTimeout(resolve, Math.max(0, ms)); });
	}

	function whenLoaded() {
		if (document.readyState === 'complete') return Promise.resolve();
		return new Promise(function (resolve) { window.addEventListener('load', function () { resolve(); }); });
	}

	// Infinite animations (spinners, carousels) never finish, so they're ignored.
	function getFiniteRunningAnimations() {
		if (typeof document.getAnimations !== 'function') return [];
		return document.getAnimations().filter(function (animation) {
			if (animation.playState !== 'running' && animation.playState !== 'pending') return false;
			var timing = animation.effect && animation.effect.getComputedTiming ? animation.effect.getComputedTiming() : null;
			return !timing || timing.endTime !== Infinity;
		});
	}

	function waitForAnimations(maxWait) {
		var deadline = Date.now() + maxWait;
		function check() {
			var running = getFiniteRunningAnimations();
			var remaining = deadline - Date.now();
			if (!running.length || remaining <= 0) return Promise.resolve();
			var finished = Promise.all(running.map(function (animation) {
				return animation.finished.catch(function () { /* cancelled - fine */ });
			}));
			return Promise.race([finished, wait(remaining)]).then(function () { return wait(50); }).then(check);
		}
		return check();
	}

	// Measure final colours, not mid-fade ones, which cause false contrast failures.
	function waitForPageToSettle(delay) {
		return whenLoaded()
			.then(function () { return wait(delay); })
			.then(function () { return waitForAnimations(MAX_ANIMATION_WAIT_MS); });
	}

	function runTest(testsToRun, nonce, testDelay) {
		var axeScript = document.createElement('script');
		axeScript.src = assetOrigin + '/App_Plugins/AccessibilityReporter/libs/axe-core.min.js';
		axeScript.onerror = function () {
			respond({ error: 'Failed to load axe-core (network error, or blocked by this page\'s Content-Security-Policy - a nonce-based CSP needs \'strict-dynamic\' to allow this).' }, nonce);
		};
		axeScript.onload = function () {
			/* global axe */
			waitForPageToSettle(typeof testDelay === 'number' ? testDelay : 500)
				.then(function () { return axe.run({ runOnly: { type: 'tag', values: testsToRun } }); })
				.then(function (results) { respond(results, nonce); })
				.catch(function (error) { respond({ error: String(error) }, nonce); });
		};
		document.body.appendChild(axeScript);
	}

	function announcePresence() {
		// Lets Accessibility Reporter know this page has the bridge installed without needing to
		// wait for a full test cycle. '*' for the same reason as respond() above.
		window.parent.postMessage({ source: 'accessibility-reporter-bridge', event: 'ready' }, '*');
	}

	// Repeat instead of a single fire-and-forget ping, so one late/dropped message can't fail
	// presence detection. Capped in case a run-test command never arrives.
	announcePresence();
	var announceInterval = setInterval(announcePresence, 300);
	setTimeout(function () { clearInterval(announceInterval); }, 10000);

	// No event.origin check here - this script has no reliable way to know the backoffice's real
	// origin in advance (see assetOrigin above), so instead it relies entirely on the window.name
	// activation gate at the top of this file: only the Accessibility Reporter parent that created
	// this exact iframe could have set that name before navigating it here.
	window.addEventListener('message', function (event) {
		var data = event.data;
		if (!data || data.source !== 'accessibility-reporter' || data.command !== 'run-test') return;
		clearInterval(announceInterval);
		runTest(data.testsToRun || [], data.nonce, data.testDelay);
	});
}(window, document));
