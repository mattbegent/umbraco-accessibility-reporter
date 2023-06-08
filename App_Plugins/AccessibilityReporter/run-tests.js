async function getConfigOptions() {
    const response = await fetch("/umbraco/backoffice/api/config/current");
    const jsonData = await response.json();
    return jsonData;
}

function waitForAxe() {
    if (typeof axe !== "undefined") {
        getConfigOptions().
            then((options)=> {
                return axe
                    .run({
                        runOnly: {
                            type: 'tag',
                            values: options.TestsToRun
                        }
                    })
            })
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