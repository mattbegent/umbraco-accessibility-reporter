/* Run Tests */

(function (window, document) {

    function documentReady(fn) {
        if (document.readyState === "complete") {
            setTimeout(fn, 1);
        } else {
            window.addEventListener("load", fn);
        }
    }

    documentReady(function() {

        return axe
            .run({
                runOnly: {
                    type: 'tag',
                    values: parent.ACCESSIBILITY_REPORTER_CONFIG.testsToRun
                }
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
