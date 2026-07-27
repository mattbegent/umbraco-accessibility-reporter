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
	var trustedOrigin = window.AR_BRIDGE_ORIGIN || (scriptEl && scriptEl.src ? new URL(scriptEl.src).origin : null);

	if (!trustedOrigin) {
		console.error('[AccessibilityReporter] bridge could not determine a trusted origin to communicate with - set window.AR_BRIDGE_ORIGIN before this script runs if it is not loaded as a plain <script src> tag.');
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
		window.parent.postMessage(message, trustedOrigin);
	}

	function runTest(testsToRun, nonce) {
		var axeScript = document.createElement('script');
		axeScript.src = trustedOrigin + '/App_Plugins/AccessibilityReporter/libs/axe-core.min.js';
		axeScript.onerror = function () {
			respond({ error: 'Failed to load axe-core (network error, or blocked by this page\'s Content-Security-Policy - a nonce-based CSP needs \'strict-dynamic\' to allow this).' }, nonce);
		};
		axeScript.onload = function () {
			/* global axe */
			axe.run({ runOnly: { type: 'tag', values: testsToRun } })
				.then(function (results) { respond(results, nonce); })
				.catch(function (error) { respond({ error: String(error) }, nonce); });
		};
		document.body.appendChild(axeScript);
	}

	window.addEventListener('message', function (event) {
		if (event.origin !== trustedOrigin) return;
		var data = event.data;
		if (!data || data.source !== 'accessibility-reporter' || data.command !== 'run-test') return;
		runTest(data.testsToRun || [], data.nonce);
	});

	// Announce presence immediately, unconditionally - lets Accessibility Reporter know this page
	// has the bridge installed without needing to wait for a full test cycle.
	window.parent.postMessage({ source: 'accessibility-reporter-bridge', event: 'ready' }, trustedOrigin);
}(window, document));
