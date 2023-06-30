class AccessibilityReporter {

    static impacts = ["minor","moderate","serious","critical"];

    static async runTest(testUrl) {
        
        return new Promise(async (resolve, reject) => {

            try {

                const testRequest = new Request(testUrl);
                await fetch(testRequest);

                const iframeId = "arTestIframe";

                window.addEventListener("message", function(message) {
                    if(message.data) {
                        resolve(message.data);
                    } else {
                        reject(message);
                    } 
                    document.getElementById(iframeId).remove();
                }, {once : true});

                const container = document.getElementById('contentcolumn');
                const testIframe = document.createElement("iframe");
                testIframe.setAttribute("src", testUrl);        
                testIframe.setAttribute("id", iframeId);   
                testIframe.style.width = "1280px";
                testIframe.style.height = "800px";
                testIframe.style.zIndex = "1";
                testIframe.style.position = "absolute";
                container.appendChild(testIframe);

                testIframe.onload = function() {
                    var scriptAxe = testIframe.contentWindow.document.createElement("script");
                    scriptAxe.type = "text/javascript";
                    scriptAxe.src = "/App_Plugins/AccessibilityReporter/libs/axe.min.js";
                    testIframe.contentWindow.document.body.appendChild(scriptAxe);
                };        

            } catch (error) {
                // Possible Security Error (another origin)
                reject(error); 
            }
        });
    }

    static sortIssues(a, b) {
        if(a.impact === b.impact) {
            return  b.nodes.length - a.nodes.length;
        }
        if(AccessibilityReporter.impacts.indexOf(a.impact) > AccessibilityReporter.impacts.indexOf(b.impact)) {
            return -1;
        }
        if(AccessibilityReporter.impacts.indexOf(a.impact) < AccessibilityReporter.impacts.indexOf(b.impact)) {
            return 1;
        }
        return 0;
    }

    // https://www.deque.com/axe/core-documentation/api-documentation/
    static mapTagsToStandard(tags) {
        var catTagsRemoved = tags.filter(tag => {
            return tag.indexOf('cat.') === -1 && !tag.startsWith('TT') && !tag.startsWith('ACT');
        });
        var formattedTags = catTagsRemoved.map(AccessibilityReporter.axeTagToStandard);
        return formattedTags;
    }

    static upperCaseFirstLetter(word) {
        return word.charAt(0).toUpperCase() + word.slice(1);
    }

    static impactToTag(impact) {
        switch(impact) {
            case "serious":
            case "critical":
              return "danger";
            case "moderate":
                return "warning";
            default:
              return "default";
        };
    };

    static axeTagToStandard(tag) {
        switch (tag) {
            case "wcag2a":
                return "WCAG 2.0 A";
            case "wcag2aa":
                return "WCAG 2.0 AAA";
            case "wcag2aaa":
                return "WCAG 2.0 AAA";
            case "wcag21a":
                return "WCAG 2.1 A";
            case "wcag21aa":
                return "WCAG 2.1 AAA";
            case "wcag21aaa":
                return "WCAG 2.1 AAA";
            case "wcag22a":
                return "WCAG 2.2 A";
            case "wcag22aa":
                return "WCAG 2.2 AAA";
            case "wcag22aaa":
                return "WCAG 2.2 AAA";
            case "best-practice":
                return "Best Practice";
            case "section508":
                return "Section 508";
            default:
                break;
        }
        if(tag.indexOf('wcag') !== -1) {
            return tag.toUpperCase();
        }
        if(tag.indexOf('section') !== -1) {
            return tag.replace('section', 'Section ');
        }
        return tag;
    }

    static getRule(ruleId) {
        const allRules = axe.getRules();
        return allRules.find(rule => rule.ruleId = ruleId);
    }

    static getBaseURL() {
        return location.protocol + "//"  + location.hostname + (location.port ? ":" + location.port : "");
    }

}

angular.module("umbraco")
.factory('AccessibilityReporterService', function() {
    return AccessibilityReporter
  });