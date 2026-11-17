/* Run Tests */

(function (window, document) {

    // Caps the animation wait so a page that keeps starting animations can't stall the test.
    // Keep in sync with the bridge script and AR_MAX_ANIMATION_WAIT_MS in accessibility-reporter.service.ts.
    var MAX_ANIMATION_WAIT_MS = 5000;

    function documentReady(fn) {
        if (document.readyState === "complete") {
            setTimeout(fn, 1);
        } else {
            window.addEventListener("load", fn);
        }
    }

    function wait(ms) {
        return new Promise(function (resolve) { setTimeout(resolve, Math.max(0, ms)); });
    }

    // Infinite animations (spinners, carousels) never finish, so they're ignored.
    function getFiniteRunningAnimations() {
        if (typeof document.getAnimations !== "function") return [];
        return document.getAnimations().filter(function (animation) {
            if (animation.playState !== "running" && animation.playState !== "pending") return false;
            var timing = animation.effect && animation.effect.getComputedTiming ? animation.effect.getComputedTiming() : null;
            return !timing || timing.endTime !== Infinity;
        });
    }

    // Re-checks after each batch, as staggered animations often start one after another.
    function waitForAnimations(maxWait) {
        var deadline = Date.now() + maxWait;
        function check() {
            var running = getFiniteRunningAnimations();
            var remaining = deadline - Date.now();
            if (!running.length || remaining <= 0) return Promise.resolve();
            var finished = Promise.all(running.map(function (animation) {
                return animation.finished.catch(function () { /* cancelled - fine */ });
            }));
            return Promise.race([finished, wait(remaining)]).then(function () {
                return wait(50);
            }).then(check);
        }
        return check();
    }

    // Measure final colours, not mid-fade ones, which cause false contrast failures.
    function waitForPageToSettle(delay) {
        return wait(delay).then(function () { return waitForAnimations(MAX_ANIMATION_WAIT_MS); });
    }

    documentReady(function() {

        var config = parent.ACCESSIBILITY_REPORTER_CONFIG || {};
        var delay = typeof config.testDelay === "number" ? config.testDelay : 500;

        return waitForPageToSettle(delay)
            .then(function () {
                return axe.run({
                    runOnly: {
                        type: 'tag',
                        values: config.testsToRun
                    }
                });
            })
            .then(results => {
                parent.postMessage(results, '*');
                results = null;
                axe = null;
            })
            .catch(error => {
                parent.postMessage(error, '*');
                error = null;
                axe = null;
            });

    });

}(window, document));
