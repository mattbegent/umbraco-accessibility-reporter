function waitForAxe() {
    if (typeof axe !== "undefined") {
        axe
            .run()
            .then(results => {
                parent.postMessage(results, '*');
            })
            .catch(error => {
                parent.postMessage(error, '*');
            });
    }
    else {
        setTimeout(waitForAxe, 100);
    }
}