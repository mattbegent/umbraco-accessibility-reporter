import { write, WorkBook } from 'xlsx';
import IResults from '../Interface/IResults';
import IPageResult from '../Interface/IPageResult';
import IIssueSummary from '../Interface/IIssueSummary';

// How long to wait for an accessibility-reporter-bridge.js "ready" ping before assuming a
// cross-origin page doesn't have the bridge installed, and (once presence is confirmed) how long
// to then wait for it to actually finish running axe and report back.
export const AR_BRIDGE_PRESENCE_TIMEOUT_MS = 3000;
export const AR_BRIDGE_RESULTS_TIMEOUT_MS = 15000;

// Keep AR_MAX_ANIMATION_WAIT_MS in sync with MAX_ANIMATION_WAIT_MS in run-tests.js and the bridge script.
export const AR_DEFAULT_TEST_DELAY_MS = 500;
export const AR_MAX_ANIMATION_WAIT_MS = 5000;

// Longest a test can wait for the page to settle, which test timeouts need to allow for.
export function getSettleBudgetMs(testDelay?: number) {
    return Math.max(0, testDelay ?? AR_DEFAULT_TEST_DELAY_MS) + AR_MAX_ANIMATION_WAIT_MS;
}

// Per-origin cache of whether accessibility-reporter-bridge.js has been seen there, so a bulk run
// against many pages on a bridge-absent cross-origin site only pays the presence timeout once.
// Only ever set to 'absent' after a full presence-timeout with zero messages received - a single
// error response still means the bridge is there, just failed that one test.
const bridgeAvailability = new Map<string, 'present' | 'absent'>();

// Set as the test iframe's window.name before every navigation. accessibility-reporter-bridge.js
// (and the loader snippet/@Html.AccessibilityReporterScript() that conditionally injects it) only
// activate when window.name matches this - so on a real visit, with no such iframe involved, the
// bridge never loads or does anything. Must match the activation name in both of those places.
export const AR_BRIDGE_ACTIVATION_NAME = "accessibility-reporter-bridge-activate";

export default class AccessibilityReporterService {

    static impacts = ["minor", "moderate", "serious", "critical"];

    static async runTest(rootElement: any, testUrl: string, showWhileRunning: boolean, testsToRun: string[], testDelay?: number) {

        return new Promise(async (resolve, reject) => {

            try {
				const headers = new Headers({
                    'X-User-Agent': 'AccessibilityReporter/1.0'
                });
                const testRequest = new Request(testUrl, {
                    method: 'GET',
                    headers: headers
                });
                try {
                    await fetch(testRequest);
                } catch {
                    // A cross-origin target without Access-Control-Allow-Origin blocks this
                    // pre-check with a CORS error - it's just a same-origin traffic marker, so
                    // ignore the failure and let the iframe/bridge path do the real test.
                }
                const iframeId = "arTestIframe" + AccessibilityReporterService.randomUUID();
                const container = showWhileRunning ? rootElement.getElementById('dashboard-ar-tests') : rootElement as HTMLElement;
                let testIframe = document.createElement("iframe") as HTMLIFrameElement;

                let settled = false;
                let presenceTimer: ReturnType<typeof setTimeout> | undefined;
                let resultsTimer: ReturnType<typeof setTimeout> | undefined;
                // Only set once we know the target is cross-origin (direct injection threw) - this
                // also acts as the flag for "are we on the bridge path at all".
                let expectedOrigin: string | null = null;
                let nonce: string | null = null;

                function cleanUpIframe() {
                    if (testIframe) {
                        testIframe.src = "";
                        testIframe.remove();
                        /*@ts-ignore*/
                        testIframe = null;
                    }
                }

                function clearTimers() {
                    if (presenceTimer) clearTimeout(presenceTimer);
                    if (resultsTimer) clearTimeout(resultsTimer);
                }

                function settle(action: () => void) {
                    if (settled) return;
                    settled = true;
                    clearTimers();
                    window.removeEventListener("message", handleTestResultMessage, true);
                    cleanUpIframe();
                    action();
                }

                function startPresenceTimer() {
                    presenceTimer = setTimeout(() => {
                        if (expectedOrigin) bridgeAvailability.set(expectedOrigin, 'absent');
                        settle(() => reject('No accessibility-reporter-bridge script detected on this page.'));
                    }, AR_BRIDGE_PRESENCE_TIMEOUT_MS);
                }

                function startResultsTimer() {
                    if (presenceTimer) {
                        clearTimeout(presenceTimer);
                        presenceTimer = undefined;
                    }
                    if (resultsTimer) return;
                    resultsTimer = setTimeout(() => {
                        settle(() => reject('Timed out waiting for accessibility-reporter-bridge test results.'));
                    }, AR_BRIDGE_RESULTS_TIMEOUT_MS + getSettleBudgetMs(testDelay));
                }

                const handleTestResultMessage = function (event: any) {
                    const data = event.data;
                    if (!data) return;

                    // Presence pings update the shared cache regardless of whether this particular
                    // call has already settled, so a bridge that answers just after this call gave
                    // up still benefits later pages/calls against the same origin in this run.
                    if (data.source === 'accessibility-reporter-bridge' && data.event === 'ready') {
                        if (expectedOrigin && event.origin === expectedOrigin) {
                            bridgeAvailability.set(expectedOrigin, 'present');
                        }
                        if (settled || !testIframe || event.source !== testIframe.contentWindow) return;
                        startResultsTimer();
                        return;
                    }

                    if (settled) return;
                    if (!testIframe || event.source !== testIframe.contentWindow) return;

                    if (data.testRunner && data.testRunner.name === 'axe') {
                        // On the bridge path (expectedOrigin set) also require the origin and nonce
                        // to match this exact call - on the direct same-origin path there's nothing
                        // to check beyond the source-window check above.
                        if (expectedOrigin && (event.origin !== expectedOrigin || data.nonce !== nonce)) return;
                        settle(() => resolve(data));
                        return;
                    }

                    if (data.error && expectedOrigin && event.origin === expectedOrigin && data.nonce === nonce) {
                        settle(() => reject(data.error));
                        return;
                    }
                }
                window.addEventListener("message", handleTestResultMessage, true);

                // Set before the src so a bridge/loader snippet on the target page can see it as
                // soon as it runs - see the AR_BRIDGE_ACTIVATION_NAME comment above.
                testIframe.name = AR_BRIDGE_ACTIVATION_NAME;
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

                setTimeout(() => {
                    container.appendChild(testIframe);
                }, 0);

                testIframe.onload = function () {
                    try {
                        if (testIframe?.contentWindow?.document.body) {
                            // axe-core.min.js is the plain library, shared with the bridge script;
                            // run-tests.js (the bit that actually calls axe.run() and reports back)
                            // only runs once axe-core has finished loading, chained via onload so
                            // insertion order can't matter.
                            const iframeDocument = testIframe.contentWindow.document;
                            let axeCoreScript = iframeDocument.createElement("script");
                            axeCoreScript.type = "text/javascript";
                            axeCoreScript.src = "/App_Plugins/AccessibilityReporter/libs/axe-core.min.js";
                            axeCoreScript.onload = function () {
                                let runTestsScript = iframeDocument.createElement("script");
                                runTestsScript.type = "text/javascript";
                                runTestsScript.src = "/App_Plugins/AccessibilityReporter/libs/run-tests.js";
                                iframeDocument.body.appendChild(runTestsScript);
                                /*@ts-ignore*/
                                runTestsScript = null;
                            };
                            iframeDocument.body.appendChild(axeCoreScript);
                            /*@ts-ignore*/
                            axeCoreScript = null;
                        } else {
                            settle(() => reject('Test page has no body.'));
                        }
                    } catch (error) {
                        // Cross-origin iframe access throws a SecurityError here. Rather than giving
                        // up, fall back to the accessibility-reporter-bridge postMessage protocol -
                        // the target page may have the bridge script installed for exactly this case.
                        expectedOrigin = new URL(testUrl, location.href).origin;
                        nonce = AccessibilityReporterService.randomUUID();

                        const cached = bridgeAvailability.get(expectedOrigin);
                        if (cached === 'absent') {
                            settle(() => reject(error));
                            return;
                        }

                        if (cached === 'present') {
                            startResultsTimer();
                        } else {
                            startPresenceTimer();
                        }

                        testIframe?.contentWindow?.postMessage(
                            { source: 'accessibility-reporter', command: 'run-test', testsToRun, nonce, testDelay: testDelay ?? AR_DEFAULT_TEST_DELAY_MS },
                            expectedOrigin
                        );
                    }
                };

            } catch (error) {
                // Possible Security Error (another origin)
                reject(error);
            }
        });
    }

    static sortIssuesByImpact(a: any, b: any) {
        if (a.impact === b.impact) {
            return b.nodes.length - a.nodes.length;
        }
        if (AccessibilityReporterService.impacts.indexOf(a.impact) > AccessibilityReporterService.impacts.indexOf(b.impact)) {
            return -1;
        }
        if (AccessibilityReporterService.impacts.indexOf(a.impact) < AccessibilityReporterService.impacts.indexOf(b.impact)) {
            return 1;
        }
        return 0;
    }

    static sortByViolations(a: any, b: any) {
        return b.nodes.length - a.nodes.length;
    }

    // https://www.deque.com/axe/core-documentation/api-documentation/
    static mapTagsToStandard(tags: string[]) {
        var catTagsRemoved = tags.filter(tag => {
            return tag.indexOf('cat.') === -1 && !tag.startsWith('TT') && !tag.startsWith('ACT');
        });
        var formattedTags = catTagsRemoved.map(AccessibilityReporterService.axeTagToStandard);
        return formattedTags;
    }

    static upperCaseFirstLetter(word: string) {
        return word.charAt(0).toUpperCase() + word.slice(1);
    }

    static impactToTag(impact: string) {
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

    static axeTagToStandard(tag: string) {
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

    static getWCAGLevel(tags: string[]) {
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

    static getRule(ruleId: string) {
        /*@ts-ignore*/
        const allRules = axe.getRules();
        return allRules.find((rule: any) => rule.ruleId = ruleId);
    }

    static getBaseURL() {
        return location.protocol + "//" + location.hostname + (location.port ? ":" + location.port : "");
    }

    static formatResultForSaving(result: any, nodeId: string, culture: string) {

        return {
            "url": result.url,
            "nodeId": nodeId,
            "culture": culture,
            "date": result.timestamp,
            "violations": result.violations.map((test: any) => {
                return {
                    id: test.id,
                    errors: test.nodes.length
                }
            }),
            "incomplete": result.violations.map((test: any) => {
                return {
                    id: test.id,
                    errors: test.nodes.length
                }
            }),
            "passes": result.violations.map((test: any) => {
                return {
                    id: test.id,
                    elements: test.nodes.length
                }
            })
        }

    }

    static saveToLocalStorage(key: string, value: object) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    static MAX_NODE_DETAILS_PER_VIOLATION = 10;
    static MAX_NODE_HTML_LENGTH = 150;

    // axe targets are an array of selectors (one per iframe), each of which can itself be an
    // array when crossing shadow DOM boundaries.
    static formatNodeTarget(target: unknown): string {
        if (!Array.isArray(target)) {
            return typeof target === 'string' ? target : '';
        }
        return target.map(part => Array.isArray(part) ? part.join(' >>> ') : String(part)).join(' | ');
    }

    // 32-bit FNV-1a hash of the whitespace-collapsed HTML. Small enough to store per element,
    // and only used to tell elements apart, not for anything security related.
    static hashNodeHtml(nodeHtml: unknown): string {
        if (typeof nodeHtml !== 'string') {
            return '';
        }
        const collapsed = nodeHtml.replace(/\s+/g, ' ').trim();
        let hash = 0x811c9dc5;
        for (let index = 0; index < collapsed.length; index++) {
            hash ^= collapsed.charCodeAt(index);
            hash = Math.imul(hash, 0x01000193);
        }
        return (hash >>> 0).toString(16).padStart(8, '0');
    }

    static trimNodeHtml(nodeHtml: unknown): string {
        if (typeof nodeHtml !== 'string') {
            return '';
        }
        const collapsed = nodeHtml.replace(/\s+/g, ' ').trim();
        return collapsed.length > AccessibilityReporterService.MAX_NODE_HTML_LENGTH
            ? collapsed.slice(0, AccessibilityReporterService.MAX_NODE_HTML_LENGTH) + '…'
            : collapsed;
    }

    static withoutNodeDetails(results: IResults): IResults {
        return {
            ...results,
            pages: results.pages.map(pageResult => ({
                ...pageResult,
                violations: pageResult.violations.map(violation => ({
                    ...violation,
                    nodes: violation.nodes.map(node => ({ impact: node.impact }))
                }))
            }))
        };
    }

    static getImpactRank(impact: string) {
        return AccessibilityReporterService.impacts.indexOf(impact);
    }

    // Rolls every page's violations up into one entry per rule, highest impact and most
    // widespread first.
    static getIssueSummaries(pageResults: IPageResult[]): IIssueSummary[] {
        const issues = new Map<string, IIssueSummary>();
        const sharedElementsByIssue = new Map<string, Map<string, { target: string; html: string; pages: Set<string>; instances: number }>>();

        for (const pageResult of pageResults) {
            for (const violation of pageResult.violations) {
                let issue = issues.get(violation.id);
                if (!issue) {
                    issue = {
                        id: violation.id,
                        title: violation.title || violation.id,
                        description: violation.description || '',
                        impact: violation.impact,
                        tags: violation.tags || [],
                        helpUrl: violation.helpUrl,
                        instances: 0,
                        pages: [],
                        sharedElements: [],
                        hasElementDetails: false
                    };
                    issues.set(violation.id, issue);
                    sharedElementsByIssue.set(violation.id, new Map());
                }

                // A rule's impact can vary between pages, so report the worst seen.
                if (AccessibilityReporterService.getImpactRank(violation.impact) > AccessibilityReporterService.getImpactRank(issue.impact)) {
                    issue.impact = violation.impact;
                }
                if (!issue.helpUrl && violation.helpUrl) {
                    issue.helpUrl = violation.helpUrl;
                }

                issue.instances += violation.nodes.length;
                issue.pages.push({
                    guid: pageResult.page.guid,
                    name: pageResult.page.name,
                    url: pageResult.page.url,
                    rootName: pageResult.page.rootName,
                    score: pageResult.score,
                    instances: violation.nodes.length
                });

                const elements = sharedElementsByIssue.get(violation.id)!;
                for (const node of violation.nodes) {
                    if (!node.target) {
                        continue;
                    }
                    issue.hasElementDetails = true;
                    // Results saved before htmlHash existed fall back to the trimmed HTML.
                    const key = `${node.target}\n${node.htmlHash ?? node.html ?? ''}`;
                    let element = elements.get(key);
                    if (!element) {
                        element = { target: node.target, html: node.html ?? '', pages: new Set(), instances: 0 };
                        elements.set(key, element);
                    }
                    element.pages.add(pageResult.page.guid);
                    element.instances++;
                }
            }
        }

        for (const issue of issues.values()) {
            issue.pages.sort((a, b) => b.instances - a.instances || a.score - b.score);
            issue.sharedElements = [...sharedElementsByIssue.get(issue.id)!.values()]
                .filter(element => element.pages.size > 1)
                .map(element => ({
                    target: element.target,
                    html: element.html,
                    pageCount: element.pages.size,
                    instances: element.instances
                }))
                .sort((a, b) => b.pageCount - a.pageCount || b.instances - a.instances);
        }

        return [...issues.values()].sort((a, b) =>
            AccessibilityReporterService.getImpactRank(b.impact) - AccessibilityReporterService.getImpactRank(a.impact)
            || b.pages.length - a.pages.length
            || b.instances - a.instances);
    }

    // e.g. "Showing 11–20 of 45 issues", announced when a paginated table changes page.
    static describeRange(firstIndex: number, shownCount: number, total: number, itemName: string) {
        const format = AccessibilityReporterService.formatNumber;
        return `Showing ${format(firstIndex + 1)}–${format(firstIndex + shownCount)} of ${format(total)} ${itemName}${total === 1 ? '' : 's'}`;
    }

    static formatRuleId(ruleId: string) {
        return ruleId.replace(/-/g, ' ').replace(/(^\w{1})|(\s+\w{1})/g, (letter: string) => letter.toUpperCase());
    }

    static getItemFromLocalStorage(key: string) {
        const item = localStorage.getItem(key);
        if (item) {
            return JSON.parse(item);
        } else {
            return null;
        }
    }

    static isAbsoluteURL(urlString: string) {
        return urlString.indexOf('http://') === 0 || urlString.indexOf('https://') === 0;
    }

    // Adds a page path onto a base URL, keeping any path in the base (e.g. https://example.com/site-a),
    // the same way NodeUrlService does on the server. Absolute page URLs are returned as they are.
    static joinBaseUrl(baseUrl: string | undefined, pagePath: string) {
        if (!baseUrl || AccessibilityReporterService.isAbsoluteURL(pagePath) || pagePath.startsWith('//')) {
            return new URL(pagePath, baseUrl || location.href).toString();
        }
        const path = pagePath.startsWith('/') ? pagePath : '/' + pagePath;
        return new URL(baseUrl.replace(/\/+$/, '') + path).toString();
    }

    // Umbraco returns "#" for content it can't route (no template/domain, or culture not published).
    static isTestableUrl(url: string | null | undefined) {
        return !!url && url.trim() !== '' && !url.startsWith('#');
    }

    static getPageScore(result: any) {
        let score = 100;
        for (let index = 0; index < result.violations.length; index++) {
            const currentViolation = result.violations[index];
            score -= AccessibilityReporterService.getRuleWeight(currentViolation.id);
        }
        return Math.max(0, score);
    }

    // https://developer.chrome.com/docs/lighthouse/accessibility/scoring/
    static getRuleWeight(ruleId: string) {

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

    static formatFileName(name: string) {
        return name.replace(/\s+/g, '-').toLowerCase();
    }

    static downloadWorkbook(workbook: WorkBook, filename: string) {
        const wbout = write(workbook, { bookType: 'xlsx', type: 'array', compression: true });
        const blob = new Blob([wbout], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.addEventListener('click', (event) => {
            event.stopPropagation();
        });
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 0);
    }

    static formatNumber(numberToFormat: number) {
        return numberToFormat.toLocaleString();
    }

    static randomUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

}
