class AccessibilityReporter {

    static impacts = ["minor", "moderate", "serious", "critical"];

    static async runTest(testUrl, showWhileRunning) {

        return new Promise(async (resolve, reject) => {

            try {

                const testRequest = new Request(testUrl);
                await fetch(testRequest);
                const iframeId = "arTestIframe" + crypto.randomUUID();
                const container = document.getElementById(showWhileRunning ? 'dashboard-ar-tests' : 'contentcolumn');
                let testIframe = document.createElement("iframe");

                window.addEventListener("message", function (message) {
                    if (message.data) {
                        resolve(message.data);
                    } else {
                        reject(message);
                    }
                    testIframe.src = "";
                    testIframe.remove();
                    testIframe = null;
                }, { once: true });

                testIframe.setAttribute("src", testUrl);
                testIframe.setAttribute("id", iframeId);
                testIframe.style.height = "800px";
                if (showWhileRunning) {
                    testIframe.style.width = container.clientWidth + "px";
                } else {
                    testIframe.style.width = "1280px";
                    testIframe.style.zIndex = "1";
                    testIframe.style.position = "absolute";
                }

                requestAnimationFrame(()=> {
                    container.appendChild(testIframe);
                });

                testIframe.onload = function () {
                    let scriptAxe = testIframe.contentWindow.document.createElement("script");
                    scriptAxe.type = "text/javascript";
                    scriptAxe.src = "/App_Plugins/AccessibilityReporter/libs/axe.min.js";
                    testIframe.contentWindow.document.body.appendChild(scriptAxe);
                    scriptAxe = null;
                };

            } catch (error) {
                // Possible Security Error (another origin)
                reject(error);
            }
        });
    }

    static sortIssuesByImpact(a, b) {
        if (a.impact === b.impact) {
            return b.nodes.length - a.nodes.length;
        }
        if (AccessibilityReporter.impacts.indexOf(a.impact) > AccessibilityReporter.impacts.indexOf(b.impact)) {
            return -1;
        }
        if (AccessibilityReporter.impacts.indexOf(a.impact) < AccessibilityReporter.impacts.indexOf(b.impact)) {
            return 1;
        }
        return 0;
    }

    static sortByViolations(a, b) {
        return b.nodes.length - a.nodes.length;
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
        switch (impact) {
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
                return "WCAG 2.0 AA";
            case "wcag2aaa":
                return "WCAG 2.0 AAA";
            case "wcag21a":
                return "WCAG 2.1 A";
            case "wcag21aa":
                return "WCAG 2.1 AA";
            case "wcag21aaa":
                return "WCAG 2.1 AAA";
            case "wcag22a":
                return "WCAG 2.2 A";
            case "wcag22aa":
                return "WCAG 2.2 AA";
            case "wcag22aaa":
                return "WCAG 2.2 AAA";
            case "best-practice":
                return "Best Practice";
            case "section508":
                return "Section 508";
            default:
                break;
        }
        if (tag.indexOf('wcag') !== -1) {
            return tag.toUpperCase();
        }
        if (tag.indexOf('section') !== -1) {
            return tag.replace('section', 'Section ');
        }
        return tag;
    }

    static getWCAGLevel(tags) {
        for (let index = 0; index < tags.length; index++) {
            const tag = tags[index];
            switch (tag) {
                case 'wcagaaa':
                    return 'AAA';
                case 'wcag2aa':
                case 'wcag21aa':
                case 'wcag22aa':
                    return 'AA';
                case 'wcag2a':
                case 'wcag21a':
                case 'wcag22a':
                    return 'A';
                default:
                    continue;
            }
        }
        return 'Other';
    }

    static getRule(ruleId) {
        const allRules = axe.getRules();
        return allRules.find(rule => rule.ruleId = ruleId);
    }

    static getBaseURL() {
        return location.protocol + "//" + location.hostname + (location.port ? ":" + location.port : "");
    }

    static formatResultForSaving(result, nodeId, culture) {

        return {
            "url": result.url,
            "nodeId": nodeId,
            "culture": culture,
            "date": result.timestamp,
            "violations": result.violations.map((test) => {
                return {
                    id: test.id,
                    errors: test.nodes.length
                }
            }),
            "incomplete": result.violations.map((test) => {
                return {
                    id: test.id,
                    errors: test.nodes.length
                }
            }),
            "passes": result.violations.map((test) => {
                return {
                    id: test.id,
                    elements: test.nodes.length
                }
            })
        }

    }

    static saveToSessionStorage(key, value) {
        try {
            sessionStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error(error);
        }

    }

    static getItemFromSessionStorage(key) {
        const item = sessionStorage.getItem(key);
        if (item) {
            return JSON.parse(item);
        } else {
            return null;
        }
    }

    static isAbsoluteURL(urlString) {
        return urlString.indexOf('http://') === 0 || urlString.indexOf('https://') === 0;
    }

    static getHostnameFromString(url) {
        return new URL(url).hostname;
    }

    static getPageScore(result) {
        let score = 100;
        for (let index = 0; index < result.violations.length; index++) {
            const currentViolation = result.violations[index];
            score -= AccessibilityReporter.getRuleWeight(currentViolation.id);
        }
        return Math.max(0, score);
    }

    // https://developer.chrome.com/docs/lighthouse/accessibility/scoring/
    static getRuleWeight(ruleId) {

        switch (ruleId) {
            case "accesskeys":
                return 7;
            case "aria-allowed-attr":
                return 10;
            case "aria-allowed-role":
                return 1;
            case "aria-command-name":
                return 7;
            case "aria-dialog-name":
                return 7;
            case "aria-hidden-body":
                return 10;
            case "aria-hidden-focus":
                return 7;
            case "aria-input-field-name":
                return 7;
            case "aria-meter-name":
                return 7;
            case "aria-progressbar-name":
                return 7;
            case "aria-required-attr":
                return 10;
            case "aria-required-children":
                return 10;
            case "aria-required-parent":
                return 10;
            case "aria-roles":
                return 7;
            case "aria-text":
                return 7;
            case "aria-toggle-field-name":
                return 7;
            case "aria-tooltip-name":
                return 7;
            case "aria-treeitem-name":
                return 7;
            case "aria-valid-attr-value":
                return 10;
            case "aria-valid-attr":
                return 10;
            case "button-name":
                return 10;
            case "bypass":
                return 7;
            case "color-contrast":
                return 7;
            case "definition-list":
                return 7;
            case "dlitem":
                return 7;
            case "document-title":
                return 7;
            case "duplicate-id-active":
                return 7;
            case "duplicate-id-aria":
                return 10;
            case "form-field-multiple-labels":
                return 3;
            case "frame-title":
                return 7;
            case "heading-order":
                return 3;
            case "html-has-lang":
                return 7;
            case "html-lang-valid":
                return 7;
            case "html-xml-lang-mismatch":
                return 3;
            case "image-alt":
                return 10;
            case "image-redundant-alt":
                return 1;
            case "input-button-name":
                return 10;
            case "input-image-alt":
                return 10;
            case "label-content-name-mismatch":
                return 7;
            case "label":
                return 7;
            case "link-in-text-block":
                return 7;
            case "link-name":
                return 7;
            case "list":
                return 7;
            case "listitem":
                return 7;
            case "meta-refresh":
                return 10;
            case "meta-viewport":
                return 10;
            case "object-alt":
                return 7;
            case "select-name":
                return 7;
            case "skip-link":
                return 3;
            case "tabindex":
                return 7;
            case "table-duplicate-name":
                return 1;
            case "table-fake-caption":
                return 7;
            case "td-has-header":
                return 10;
            case "td-headers-attr":
                return 7;
            case "th-has-data-cells":
                return 7;
            case "valid-lang":
                return 7;
            case "video-caption":
                return 10;
            default:
                return 0;
        };

    }

    static formatFileName(name) {
        return name.replace(/\s+/g, '-').toLowerCase();
    }


}

angular.module("umbraco")
    .factory('AccessibilityReporterService', function () {
        return AccessibilityReporter
    });
