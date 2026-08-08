import { LitElement, css, html, customElement, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import { format } from 'date-fns'
import PageState from "../Enums/page-state";
import { UMB_CURRENT_USER_CONTEXT, UmbCurrentUserModel } from "@umbraco-cms/backoffice/current-user";
import { UMB_DOCUMENT_WORKSPACE_CONTEXT } from '@umbraco-cms/backoffice/document';
import { UMB_WORKSPACE_SPLIT_VIEW_CONTEXT } from '@umbraco-cms/backoffice/workspace';
import { tryExecute } from "@umbraco-cms/backoffice/resources";
import { AccessibilityReporterAppSettings, ConfigService, TestRun, TestRunService } from "../api";
import { UmbDocumentUrlRepository } from "@umbraco-cms/backoffice/document";
import type { UmbDocumentUrlModel } from "@umbraco-cms/backoffice/document";
import { generalStyles } from "../Styles/general";
import AccessibilityReporterAPIService from "../Services/accessibility-reporter-api.service";
import AccessibilityReporterService from "../Services/accessibility-reporter.service";
import { UMB_MODAL_MANAGER_CONTEXT } from "@umbraco-cms/backoffice/modal";
import { ACCESSIBILITY_REPORTER_MODAL_DETAIL } from "../Modals/detail/accessibilityreporter.detail.modal.token";
import { utils } from "xlsx";
import { UMB_NOTIFICATION_CONTEXT, UmbNotificationContext } from "@umbraco-cms/backoffice/notification";
import '../Components/ar-score';
import '../Components/ar-score-history';

@customElement('accessibility-reporter-workspaceview')
export class AccessibilityReporterWorkspaceViewElement extends UmbElementMixin(LitElement) {

	@state()
	private pageState: PageState;

	@state()
	config: AccessibilityReporterAppSettings | undefined;

	@state()
	currentUser: UmbCurrentUserModel | undefined;

	@state()
	private _urls?: Array<UmbDocumentUrlModel>;

	@state()
	private pageName: string = "";

	@state()
	private testURL: string = "";

	@state()
	private results: any;

	@state()
	private score: number;

	@state()
	private testTime: string;

	@state()
	private testDate: string;

	@state()
	private _testedCulture: string | null = null;

	@state()
	private _crossOriginHostname: string | null = null;

	private _splitViewIndex: number = 0;

	@state()
	private violationsOpen: boolean = true;

	@state()
	private incompleteOpen: boolean = true;

	@state()
	private passesOpen: boolean = false;

	@state()
	private history: TestRun[];

	@state()
	private _historyPageSize = 5;

	@state()
	private _historyCurrentPage = 1;

	@state()
	private _historyPagination: { currentPage: number; totalPages: number } = { currentPage: 1, totalPages: 1 };

	private _workspaceContext?: typeof UMB_DOCUMENT_WORKSPACE_CONTEXT.TYPE;

	private _currentCulture: string | null = null;

	// Sentinel (rather than null) so the first observer emission - even if the culture resolves to
	// null/invariant - is still recognised as "different from what history was fetched for".
	private _historyCulture: string | null | undefined = undefined;

	private _historyReadyResolve!: () => void;

	// init() awaits this instead of a one-off getHistory() call, so the autorun behaviour below still
	// waits for an initial history fetch, but that fetch is now solely triggered by the culture
	// observer - see _refreshHistoryForCulture - removing the race between the two.
	private _historyReadyPromise: Promise<void> = new Promise((resolve) => {
		this._historyReadyResolve = resolve;
	});

	private _modalManagerContext: typeof UMB_MODAL_MANAGER_CONTEXT.TYPE;

	private _notificationContext?: UmbNotificationContext;

	private _documentUrlRepository = new UmbDocumentUrlRepository(this);

	constructor() {
		super();
		this.pageState = PageState.ManuallyRun;
		this.init();
	}

	private async init() {

		this.consumeContext(UMB_CURRENT_USER_CONTEXT, (context) => {
			if(!context) {
				return;
			}
			this.observe(
				context.currentUser,
				(currentUser) => {
					this.currentUser = currentUser;
				},
				'currrentUserObserver',
			);
		});

		this.consumeContext(UMB_DOCUMENT_WORKSPACE_CONTEXT, (context) => {
			this._workspaceContext = context;
			this._observeContent();
		});

        this.consumeContext(UMB_MODAL_MANAGER_CONTEXT, (context) => {
			if(!context) {
				return;
			}
            this._modalManagerContext = context;
        });

		this.consumeContext(UMB_WORKSPACE_SPLIT_VIEW_CONTEXT, (context) => {
			if (!context) return;
			this.observe(context.index, (index) => {
				if (index !== undefined) {
					this._splitViewIndex = index;
				}
			});
		});

		this.consumeContext(UMB_NOTIFICATION_CONTEXT, (_instance) => {
			this._notificationContext = _instance;
		});

		this.config = await this.getConfig();

		/* Expose config to child iframe for tests */
		/*@ts-ignore*/
		window.ACCESSIBILITY_REPORTER_CONFIG = this.config;

		if (!this.config) {
			this.pageState = PageState.Errored;
			return;
		}

		if (!this.config?.testBaseUrl) {
			this.config.testBaseUrl = this.getFallbackBaseUrl();
		}

		await this._historyReadyPromise;

		const contentId = this._workspaceContext?.getUnique() as string;
		const usedCache = contentId ? await this._tryLoadCachedResult(contentId) : false;

		if (!usedCache && this.config.runTestsAutomatically) {
			this.runTests(false);
		}
	}

	private getLocalHostname() {
		return location.hostname + (location.port ? ":" + location.port : "");
	}

	// Finds a real, domain-qualified URL from the document's own URLs (populated per-node by
	// Umbraco based on the domains bound to its root) rather than assuming every site shares the
	// backoffice's own hostname - the previous behaviour, which silently tested the wrong page on
	// any multisite install where a site's domain differs from the backoffice's.
	private getResolvedAbsoluteUrl(possibleUrls?: Array<UmbDocumentUrlModel>): string | null {
		if (!possibleUrls) return null;
		for (const possibleUrl of possibleUrls) {
			if (possibleUrl.url && AccessibilityReporterService.isAbsoluteURL(possibleUrl.url)) {
				return possibleUrl.url;
			}
		}
		return null;
	}

	private getFallbackBaseUrl() {
		const resolvedAbsoluteUrl = this.getResolvedAbsoluteUrl(this._urls);
		if (resolvedAbsoluteUrl) {
			return new URL(resolvedAbsoluteUrl).origin;
		}
		// No domain bound to this node - fall back to the current backoffice host, matching the
		// original behaviour when there's nothing better to go on.
		return location.protocol + "//" + this.getLocalHostname();
	}

	// The in-iframe test injects a script directly into the iframe's document, which the browser
	// only allows for same-origin content. If the resolved test URL is on a different origin to the
	// backoffice (a genuinely different domain per site) and no external ApiUrl is configured to run
	// the test out-of-browser instead, testing would previously either hang indefinitely or silently
	// test the wrong page - surface this as an explicit, actionable error instead.
	private isCrossOriginTest(url: string): boolean {
		if (this.config?.apiUrl) return false;
		try {
			return new URL(url, location.href).origin !== location.origin;
		} catch {
			return false;
		}
	}

	private _observeContent() {
		if (!this._workspaceContext) return;

		this.pageName = this._workspaceContext.getName() as string;

		this.observe(this._workspaceContext.splitView.activeVariantsInfo, (activeVariants) => {
			this._currentCulture = activeVariants[0]?.culture ?? null;
			this._refreshHistoryForCulture();
		});

		this.observe(this._workspaceContext.unique, async (unique) => {
			if (unique) {
				await this._fetchDocumentUrls(unique);
			}
		});

	}

	private async _fetchDocumentUrls(documentUnique: string) {
		try {
			const { data } = await this._documentUrlRepository.requestItems([documentUnique]);
			if (data && data.length > 0) {
				this._urls = data[0].urls;
			} else {
				this._urls = [];
			}
		} catch (error) {
			console.error('Error fetching document URLs:', error);
			this._urls = [];
		}
	}

	private async getConfig(): Promise<AccessibilityReporterAppSettings | undefined> {
		const { data, error } = await tryExecute(this, ConfigService.current())
		if (error) {
			console.error(error);
			this.pageState = PageState.Errored;
			return undefined;
		}

		return data;
	}

	// Sole trigger for loading/reloading history - called from the activeVariantsInfo observer so it
	// always runs with the culture that's actually active, instead of racing a fetch fired from init()
	// against the async context resolution that sets _currentCulture in the first place. Also means
	// switching the active language variant (e.g. in split view) now refreshes the History panel
	// instead of leaving it showing whichever culture happened to be current on first load.
	private async _refreshHistoryForCulture() {
		if (this._currentCulture === this._historyCulture) {
			return;
		}
		this._historyCulture = this._currentCulture;

		const contentId = this._workspaceContext?.getUnique() as string;
		this.history = await this.getHistory(contentId);
		this._historyCurrentPage = 1;
		this._paginateHistory();
		this._historyReadyResolve();
	}

	// Mirrors the pagination pattern already used for the pages table in ar-has-results.ts.
	private _paginateHistory() {
		const totalPages = Math.ceil((this.history?.length ?? 0) / this._historyPageSize) || 1;
		let currentPage = this._historyCurrentPage;
		if (currentPage < 1) {
			currentPage = 1;
		} else if (currentPage > totalPages) {
			currentPage = totalPages;
		}
		this._historyCurrentPage = currentPage;
		this._historyPagination = { currentPage, totalPages };
	}

	private _getHistoryPage(): TestRun[] {
		if (!this.history?.length) return [];
		const start = (this._historyCurrentPage - 1) * this._historyPageSize;
		return this.history.slice(start, start + this._historyPageSize);
	}

	private _changeHistoryPage(pageNumber: number) {
		this._historyCurrentPage = pageNumber;
		this._paginateHistory();
	}

	private exportHistory() {
		if (!this.history?.length) {
			return;
		}

		try {
			const rows = this.history.map((run: TestRun) => ({
				date: format(run.runCompleted, "yyyy-MM-dd HH:mm:ss"),
				score: run.score,
				passed: run.passedCount,
				failed: run.failedCount,
				incomplete: run.incompleteCount
			}));

			const worksheet = utils.json_to_sheet(rows);
			utils.sheet_add_aoa(worksheet, [["Date", "Score", "Passed", "Failed", "Incomplete"]], { origin: "A1" });
			worksheet["!cols"] = [{ width: 22 }, { width: 10 }, { width: 10 }, { width: 10 }, { width: 12 }];

			const workbook = utils.book_new();
			utils.book_append_sheet(workbook, worksheet, "History");

			AccessibilityReporterService.downloadWorkbook(workbook,
				AccessibilityReporterService.formatFileName(`accessibility-history-${this.pageName}-${format(new Date(), "yyyy-MM-dd")}`) + ".xlsx");
		} catch (error) {
			console.error(error);
			this._notificationContext?.peek('danger', { data: { message: 'An error occurred exporting the history. Please try again later.' } });
		}
	}

	private async getHistory(contentId: string): Promise<TestRun[] | []> {
		const { data, error } = await tryExecute(this, TestRunService.runs({
			path: {
				contentId: contentId,
				culture: this._currentCulture ?? ""
			}
		}));

		if (error) {
			console.error(error);
			this.pageState = PageState.Errored;
			return [];
		}

		return data ?? [];
	}

	private async saveTestRun(contentId: string, contentCulture: string, contentHash: string,  resultPayload: string) {
		const { data, error } = await tryExecute(this, TestRunService.create({
			path: {
				contentId: contentId,
				culture: contentCulture,
				contentHash: contentHash
			},
			body: resultPayload
		}));

		if (error) {
			console.error(error);
		}

		console.log(data);
	}

	private async getTestResult(testUrl: string, showTestRunning: boolean = true) {
		return this.config?.apiUrl ? AccessibilityReporterAPIService.getIssues(this.config, testUrl, this.currentUser?.languageIsoCode ?? "") : AccessibilityReporterService.runTest(this.shadowRoot, testUrl, showTestRunning, this.config?.testsToRun ?? []);
	}

	private _getActiveCultureFromRoute(): string | null {
		const path = window.location.pathname;
		const viewIndex = path.lastIndexOf('/view/');
		if (viewIndex === -1) return null;
		const segments = path.substring(0, viewIndex).split('/');
		const culture = segments[segments.length - 1];
		return (culture && culture !== 'invariant') ? culture : null;
	}

	private _getUrlForCulture(culture: string | null): string {
		if (!this._urls || this._urls.length === 0) return "/";
		if (culture) {
			const match = this._urls.find(u =>
				u.culture?.toLowerCase() === culture.toLowerCase()
			);
			if (match?.url) return match.url;
		}
		return this._urls[0]?.url || "/";
	}

	// Shared by runTests() and _tryLoadCachedResult() so both resolve the same tested culture and
	// URL - ensuring document URLs are fetched first, then accounting for split view panels.
	private async _resolveTestTarget(): Promise<{ culture: string | null; url: string }> {
		// Ensure we have document URLs before resolving a path
		if (!this._urls || this._urls.length === 0) {
			if (this._workspaceContext?.getUnique()) {
				try {
					await this._fetchDocumentUrls(this._workspaceContext.getUnique()!);
				} catch (error) {
					console.error('Failed to fetch document URLs before testing:', error);
					// Continue with fallback URL if fetching fails
				}
			}
		}

		const routeCulture = this._getActiveCultureFromRoute();
		let activeCulture: string | null;
		if (routeCulture && routeCulture.includes('_&_')) {
			// Split view: resolve the culture for the current panel index
			const activeVariants = this._workspaceContext?.splitView.getActiveVariants();
			activeCulture = activeVariants?.find(v => v.index === this._splitViewIndex)?.culture ?? null;
		} else {
			activeCulture = routeCulture;
		}
		const pathToTest = this._getUrlForCulture(activeCulture);
		const url = new URL(pathToTest, this.config?.testBaseUrl).toString();
		return { culture: activeCulture, url };
	}

	// Skips a fresh live test when the last stored run already reflects the current content: its
	// contentHash still matches, and it isn't older than config.maxCacheAgeHours (0 disables the
	// age check, leaving the content hash as the sole staleness signal). Falls back to a live run
	// in init() when the cache is missing or stale.
	private async _tryLoadCachedResult(contentId: string): Promise<boolean> {
		if (!this.history?.length) return false;

		const lastRun = this.history[0];
		let payload: any;
		try {
			payload = JSON.parse(lastRun.resultPayload ?? '{}');
		} catch {
			return false;
		}

		const currentContentHash = await this.#computeContentHash(contentId);
		if (!payload.contentHash || payload.contentHash !== currentContentHash) {
			return false;
		}

		const maxAgeHours = this.config?.maxCacheAgeHours ?? 0;
		if (maxAgeHours > 0) {
			const ageMs = Date.now() - new Date(lastRun.runCompleted).getTime();
			if (ageMs > maxAgeHours * 60 * 60 * 1000) {
				return false;
			}
		}

		const { culture, url } = await this._resolveTestTarget();
		this._testedCulture = culture;
		this.testURL = url;
		this._crossOriginHostname = null;

		this.results = payload;
		this.score = lastRun.score;
		const timestamp = payload.timestamp ?? lastRun.runCompleted;
		this.testTime = format(timestamp, "HH:mm:ss");
		this.testDate = format(timestamp, "MMMM do yyyy");
		this.pageState = PageState.Loaded;

		return true;
	}

	private async runTests(showTestRunning: boolean): Promise<void> {

		const isRerun = this.results != null;
		this.pageState = PageState.Loading;

		const { culture, url } = await this._resolveTestTarget();
		this._testedCulture = culture;
		this.testURL = url;
		this._crossOriginHostname = null;

		try {
			// Always attempt the test, even cross-origin - accessibility-reporter-bridge.js may be
			// installed on the target site, in which case this succeeds without ever reaching the
			// catch block below.
			const testResponse = await this.getTestResult(this.testURL, showTestRunning); // TODO: Add types
			this.results = this.sortResponse(testResponse);
			this.score = AccessibilityReporterService.getPageScore(testResponse);
			this.pageState = PageState.Loaded;
			this.testTime = format(testResponse.timestamp, "HH:mm:ss");
			this.testDate = format(testResponse.timestamp, "MMMM do yyyy");

			const contentId = this._workspaceContext?.getUnique() as string;
			const contentHash = await this.#computeContentHash(contentId, isRerun);
			const lastRunHash = this.#getLastRunHash();
			if (contentHash !== lastRunHash) {
				const payload = { ...this.results, contentHash, culture: this._currentCulture };
				await this.saveTestRun(contentId, this._currentCulture ?? "", contentHash, JSON.stringify(payload));
				this._historyCulture = this._currentCulture;
				this.history = await this.getHistory(contentId);
				this._historyCurrentPage = 1;
				this._paginateHistory();
			}
		} catch (error) {
			if (this.isCrossOriginTest(this.testURL)) {
				this._crossOriginHostname = new URL(this.testURL).hostname;
			}
			this.pageState = PageState.Errored;
			console.error(error);
		}

	}

	async #computeContentHash(contentId: string, includeTimestamp = false): Promise<string> {
		const data = this._workspaceContext?.getData();
		const values = [...(data?.values ?? [])].sort((a, b) => a.alias.localeCompare(b.alias));
		const timestamp = includeTimestamp ? new Date().toISOString() : '';
		const input = contentId + timestamp + JSON.stringify(values);
		const encoded = new TextEncoder().encode(input);
		const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
		return Array.from(new Uint8Array(hashBuffer))
			.map(b => b.toString(16).padStart(2, '0'))
			.join('');
	}

	#getLastRunHash(): string | undefined {
		if (!this.history?.length) return undefined;
		try {
			// history is ordered newest-first (see TestRunSqlRepository.Runs), so the most recent run
			// is index 0, not the last index - comparing against the last index compared against the
			// OLDEST run instead, meaning re-running on unchanged content never actually deduped.
			const lastPayload = JSON.parse(this.history[0].resultPayload ?? '{}');
			return lastPayload.contentHash;
		} catch {
			return undefined;
		}
	}

	#getTrend(current: number, previous: number | undefined, higherIsBetter: boolean): 'improved' | 'worsened' | 'same' | null {
		if (previous === undefined) return null;
		if (current === previous) return 'same';
		const improved = higherIsBetter ? current > previous : current < previous;
		return improved ? 'improved' : 'worsened';
	}

	#renderTrend(trend: 'improved' | 'worsened' | 'same' | null) {
		if (trend === null) return null;
		if (trend === 'improved') return html`<span class="c-trend c-trend--improved" aria-label="Improved">&uarr;</span>`;
		if (trend === 'worsened') return html`<span class="c-trend c-trend--worsened" aria-label="Worsened">&darr;</span>`;
		return html`<span class="c-trend c-trend--same" aria-label="No change">&rarr;</span>`;
	}

	private sortResponse(results: any) {
		const sortedViolations = results.violations.sort(AccessibilityReporterService.sortIssuesByImpact);
		results.violations = sortedViolations;
		const sortedIncomplete = results.incomplete.sort(AccessibilityReporterService.sortIssuesByImpact);
		results.incomplete = sortedIncomplete;
		return results;
	}

	private totalIssues() {
		if (!this.results) {
			return 0;
		}
		let total = 0;
		for (let index = 0; index < this.results.violations.length; index++) {
			total += this.results.violations[index].nodes.length;
		}
		return total.toString();
	};

	private totalIncomplete() {
		if (!this.results) {
			return 0;
		}
		let total = 0;
		for (let index = 0; index < this.results.incomplete.length; index++) {
			total += this.results.incomplete[index].nodes.length;
		}
		return total.toString();
	};

	private toggleViolations() {
		this.violationsOpen = !this.violationsOpen;
	};

	private togglePasses() {
		this.passesOpen = !this.passesOpen;
	};

	private toggleIncomplete() {
		this.incompleteOpen = !this.incompleteOpen;
	};

	private async openDetail(result: any) {
		this._modalManagerContext?.open(this, ACCESSIBILITY_REPORTER_MODAL_DETAIL, {
			data: {
				result: result
			}
		});
	};

	private failedTitle() {
		let title = 'Failed Test';
		if (this.results.violations.length !== 1) {
			title += 's';
		}
		if (this.totalIssues() !== "0") {
			title += ` due to ${this.totalIssues()} Violation`;
			if (this.totalIssues() !== "1") {
				title += 's';
			}
		}
		return title;
	};

	private incompleteTitle() {
		let title = 'Incomplete Test';
		if (this.results.violations.length !== 1) {
			title += 's';
		}
		if (this.totalIncomplete() !== "0") {
			title += ` due to ${this.totalIncomplete()} Violation`;
			if (this.totalIncomplete() !== "1") {
				title += 's';
			}
		}
		return title;
	};


	private formattedResultsForExport(results: any) {
		let formattedRows = [];
		for (let index = 0; index < results.length; index++) {
			const currentResult = results[index];
			formattedRows.push({
				impact: currentResult.impact ? AccessibilityReporterService.upperCaseFirstLetter(currentResult.impact) : '',
				title: currentResult.help,
				description: currentResult.description,
				standard: AccessibilityReporterService.mapTagsToStandard(currentResult.tags).join(', '),
				errors: currentResult.nodes.length
			});
		}
		return formattedRows;
	}

	private exportResults() {

		try {

			const failedRows = this.formattedResultsForExport(this.results.violations);
			const incompleteRows = this.formattedResultsForExport(this.results.incomplete);
			const passedRows = this.formattedResultsForExport(this.results.passes);

			const failedWorksheet = utils.json_to_sheet(failedRows);
			const incompleteWorksheet = utils.json_to_sheet(incompleteRows);
			const passedWorksheet = utils.json_to_sheet(passedRows);
			const workbook = utils.book_new();
			utils.book_append_sheet(workbook, failedWorksheet, "Failed Tests");
			utils.book_append_sheet(workbook, incompleteWorksheet, "Incomplete Tests");
			utils.book_append_sheet(workbook, passedWorksheet, "Passed Tests");

			const headers = [["Impact", "Title", "Description", "Accessibility Standard", "Violations"]];
			const passedHeaders = [["Impact", "Title", "Description", "Accessibility Standard", "Elements"]];
			utils.sheet_add_aoa(failedWorksheet, headers, { origin: "A1" });
			utils.sheet_add_aoa(incompleteWorksheet, headers, { origin: "A1" });
			utils.sheet_add_aoa(passedWorksheet, passedHeaders, { origin: "A1" });

			const failedTitleWidth = failedRows.reduce((w, r) => Math.max(w, r.title.length), 40);
			const incompleteTitleWidth = incompleteRows.reduce((w, r) => Math.max(w, r.title.length), 40);
			const passedTitleWidth = passedRows.reduce((w, r) => Math.max(w, r.title.length), 40);
			failedWorksheet["!cols"] = [{ width: 10 }, { width: failedTitleWidth }, { width: 40 }, { width: 25 }, { width: 8 }  ];
			incompleteWorksheet["!cols"] = [{ width: 10 }, { width: incompleteTitleWidth }, { width: 40 }, { width: 25 }, { width: 8 }  ];
			passedWorksheet["!cols"] = [{ width: 10 }, { width: passedTitleWidth }, { width: 40 }, { width: 25 }, { width: 8 }  ];

			AccessibilityReporterService.downloadWorkbook(workbook,
				AccessibilityReporterService.formatFileName(`accessibility-report-${this.pageName}-${format(this.results.timestamp, "yyyy-MM-dd")}`) + ".xlsx");

		} catch(error) {
			console.error(error);
			this._notificationContext?.peek('danger', { data: { message: 'An error occurred exporting the report. Please try again later.' } });
		}

	};


	render() {

		if (this.pageState === PageState.ManuallyRun) {
			return html`
			<uui-box>
				<div slot="headline" class="c-title__group">
					<svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" style="enable-background:new 0 0 24 24" viewBox="0 0 24 24" width="42" height="42">
					<path d="M12 22c5.5 0 10-4.5 10-10S17.5 2 12 2 2 6.5 2 12s4.5 10 10 10z" style="fill:#ffffff;stroke:#443b52;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round" />
					<path d="m7 9 5 1m5-1-5 1m0 0v3m0 0-2 5m2-5 2 5" style="fill:none;stroke:#443b52;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round" />
					<path d="M12 8.5c-.7 0-1.2-.6-1.2-1.3S11.3 6 12 6s1.2.6 1.2 1.2-.5 1.3-1.2 1.3z" style="fill:#443b52" />
					</svg>
					<h2 class="c-title">Accessibility Reporter</h2>
				</div>
				<p>Start running accessibility tests on the current published version of ${this.testURL} by using the button below.</p>
				<uui-button look="primary" color="default" @click="${this.runTests}" label="Run accessibility tests on current published page">Run tests</uui-button>
			</uui-box>
			`;
		}

		if (this.pageState === PageState.Loading) {
			return html`
			<uui-box>
				<div slot="headline" class="c-title__group">
					<svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" style="enable-background:new 0 0 24 24" viewBox="0 0 24 24" width="42" height="42">
					<path d="M12 22c5.5 0 10-4.5 10-10S17.5 2 12 2 2 6.5 2 12s4.5 10 10 10z" style="fill:#ffffff;stroke:#443b52;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round" />
					<path d="m7 9 5 1m5-1-5 1m0 0v3m0 0-2 5m2-5 2 5" style="fill:none;stroke:#443b52;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round" />
					<path d="M12 8.5c-.7 0-1.2-.6-1.2-1.3S11.3 6 12 6s1.2.6 1.2 1.2-.5 1.3-1.2 1.3z" style="fill:#443b52" />
					</svg>
					<h2 class="c-title">Running Accessibility Tests on <a href="${this.testURL}" target="_blank" class="c-title__link">${this.pageName} <span class="sr-only">(opens in a new window)</span></a></h2>
				</div>
				<uui-loader-bar animationDuration="1.5" style="color: #443b52"></uui-loader-bar>
				<div id="dashboard-ar-tests" class="c-test-container"></div>
        	</uui-box>`;
		}

		if (this.pageState === PageState.Errored) {
			return html`
			<uui-box>
				<div slot="headline" class="c-title__group">
					<svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" style="enable-background:new 0 0 24 24" viewBox="0 0 24 24" width="42" height="42">
					<path d="M12 22c5.5 0 10-4.5 10-10S17.5 2 12 2 2 6.5 2 12s4.5 10 10 10z" style="fill:#ffffff;stroke:#443b52;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round" />
					<path d="m7 9 5 1m5-1-5 1m0 0v3m0 0-2 5m2-5 2 5" style="fill:none;stroke:#443b52;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round" />
					<path d="M12 8.5c-.7 0-1.2-.6-1.2-1.3S11.3 6 12 6s1.2.6 1.2 1.2-.5 1.3-1.2 1.3z" style="fill:#443b52" />
					</svg>
					<h2 class="c-title">Accessibility Report for <a href="${this.testURL}" target="_blank" class="c-title__link">${this.pageName} <span class="sr-only">(opens in a new window)</span></a> errored</h2>
				</div>
				${this._crossOriginHostname ? html`
				<p>This page is on a different domain (<strong>${this._crossOriginHostname}</strong>) to your Umbraco backoffice, so in-browser testing can't run against it directly for security reasons.</p>
				<p>To test sites on a different domain in a multisite install, either add the <code>accessibility-reporter-bridge.js</code> script to that site, or configure <code>ApiUrl</code> to run tests via an external service instead - see the Accessibility Reporter documentation for details.</p>
				` : html`
				<p>Accessibility Reporter only works for URLs that are accessible publicly.</p>
				<p>If your page is publicly accessible, please try using the "Rerun Tests" button below or refreshing this page to run the accessibility report again.</p>
				`}
				<uui-button look="primary" color="default" @click="${this.runTests}" label="Rerun accessibility tests on current published page">Rerun tests</uui-button>
			</uui-box>
			`;
		}

		if (this.pageState === PageState.Loaded) {
			// history is newest-first - see the note in #getLastRunHash().
			const lastRun = this.history?.length > 0 ? this.history[0] : undefined;
			return html`
			<div>
				<uui-box style="margin-bottom: 20px;">

					<div slot="headline" class="c-title__group">
						<svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" style="enable-background:new 0 0 24 24" viewBox="0 0 24 24" width="42" height="42">
						<path d="M12 22c5.5 0 10-4.5 10-10S17.5 2 12 2 2 6.5 2 12s4.5 10 10 10z" style="fill:#ffffff;stroke:#443b52;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round" />
						<path d="m7 9 5 1m5-1-5 1m0 0v3m0 0-2 5m2-5 2 5" style="fill:none;stroke:#443b52;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round" />
						<path d="M12 8.5c-.7 0-1.2-.6-1.2-1.3S11.3 6 12 6s1.2.6 1.2 1.2-.5 1.3-1.2 1.3z" style="fill:#443b52" />
						</svg>
						<h2 class="c-title">Accessibility Report for <a href="${this.testURL}" target="_blank" class="c-title__link">${this.pageName} <span class="sr-only">(opens in a new window)</span></a>${this._testedCulture ? html` <uui-tag look="outline" color="default" style="margin-left: 6px;">${this._testedCulture}</uui-tag>` : null}</h2>
					</div>

					<div class="c-summary__container">
						<div class="c-summary c-summary--issues">
							<ar-score score="${this.score}">
								${this.#renderTrend(this.#getTrend(this.score, lastRun?.score, true))}
							</ar-score>

						</div>
						<div class="c-summary c-summary--issues">
							<div class="c-summary__circle">
								${this.results.violations.length}
								<span class="c-summary__title">Failed</span>
								${this.#renderTrend(this.#getTrend(this.results.violations.length, lastRun?.failedCount, false))}
							</div>
						</div>
						<div class="c-summary c-summary--incomplete">
							<div class="c-summary__circle">
								${this.results.incomplete.length}
								<span class="c-summary__title">Incomplete</span>
								${this.#renderTrend(this.#getTrend(this.results.incomplete.length, lastRun?.incompleteCount, false))}
							</div>
						</div>
						<div class="c-summary c-summary--passed">
							<div class="c-summary__circle">
								${this.results.passes.length}
								<span class="c-summary__title">Passed</span>
								${this.#renderTrend(this.#getTrend(this.results.passes.length, lastRun?.passedCount, true))}
							</div>
						</div>
					</div>
					<p>
						<uui-button look="primary" color="default" @click="${this.runTests}" label="Rerun accessibility tests on current published page" class="c-summary__button">Rerun tests</uui-button>
						<uui-button look="secondary" color="default" @click="${this.exportResults}" label="Export accessibility test results as an xlsx file" class="c-summary__button">Export results</uui-button>
						<span class="c-summary__time"><strong>${this.testTime}</strong> on <strong>${this.testDate}</strong></span>
					</p>

				</uui-box>

				<uui-box style="margin-bottom: 20px;">
					<button type="button" slot="headline" class="c-accordion-header" @click="${this.toggleViolations}" aria-expanded="${this.violationsOpen === true}" id="violationsAccordion">
						<div class="c-title__group">
							<div class="c-circle c-circle--failed"><div class="c-circle__text">${this.results.violations.length}</div></div>
							<h2 class="c-accordion-header__title c-title">
								${this.failedTitle()}
								${this.results.violations.length ?
								html`
									${this.violationsOpen ?
										html`<uui-symbol-expand open></uui-symbol-expand>`
										: html`<uui-symbol-expand></uui-symbol-expand>`
									}
												`
								: null}
							</h2>
						</div>

					</button>
					${this.results.violations.length ? html`
					<div role="region" aria-labelledby="violationsAccordion">
						<p>All of the following need fixing to improve the accessibility of this page.</p>
						<div class="c-table__container">
							${this.violationsOpen ? html`
							<uui-table>
								<uui-table-head>
									<uui-table-head-cell>Impact</uui-table-head-cell>
									<uui-table-head-cell>Title</uui-table-head-cell>
									<uui-table-head-cell>Description</uui-table-head-cell>
									<uui-table-head-cell>Accessibility Standard</uui-table-head-cell>
									<uui-table-head-cell>Violations</uui-table-head-cell>
									<uui-table-head-cell>Action</uui-table-head-cell>
								</uui-table-head>
								${this.results.violations.map((result: any) => html`
								<uui-table-row @click="${()=>this.openDetail(result)}" style="cursor: pointer;">
									<uui-table-cell><uui-tag color="${AccessibilityReporterService.impactToTag(result.impact)}" look="primary">${AccessibilityReporterService.upperCaseFirstLetter(result.impact)}</uui-tag></uui-table-cell>
									<uui-table-cell>${result.help}</uui-table-cell>
									<uui-table-cell>${result.description}</uui-table-cell>
									<uui-table-cell>
										${AccessibilityReporterService.mapTagsToStandard(result.tags).map((tag: any) => html`
											<uui-tag color="default" look="outline" class="c-tag">${tag}</uui-tag>
										`)}
									</uui-table-cell>
									<uui-table-cell><div class="c-incident-number c-incident-number--${result.impact}"><div class="c-incident-number__text">${result.nodes.length}</div></div></uui-table-cell>
									<uui-table-cell>
										<button type="button" class="c-detail-button">
											<span class="c-detail-button__group">
												<uui-icon-registry-essential>
													<uui-icon name="see"></uui-icon>
												</uui-icon-registry-essential>
												<span class="c-detail-button__text">
													View Details <span class="sr-only">about ${result.help}</span>
												</span>
											</span>
										</button>
									</uui-table-cell>
								</uui-table-row>
								`)}
							</uui-table>
							`: null}
						</div>
					</div>
					`: html`<p>No tests failed! High 5, you rock!</p>`}
				</uui-box>

				<uui-box style="margin-bottom: 20px;">
					<button type="button" slot="headline" class="c-accordion-header" @click="${this.toggleIncomplete}" aria-expanded="${this.incompleteOpen === true}" id="incompleteAccordion">
						<div class="c-title__group">
							<div class="c-circle c-circle--incomplete"><div class="c-circle__text">${this.results.incomplete.length}</div></div>
							<h2 class="c-accordion-header__title c-title">
								${this.incompleteTitle()}
								${this.results.incomplete.length ?
								html`
									${this.incompleteOpen ?
									html`<uui-symbol-expand open></uui-symbol-expand>`
									: html`<uui-symbol-expand></uui-symbol-expand>`
										}
								`
							: null}
							</h2>
						</div>

					</button>
					${this.results.incomplete.length ? html`
					<div role="region" aria-labelledby="incompleteAccordion">
						<p>These tests could not be definitively passed or failed. Please manually review these tests.</p>
						<div class="c-table__container">
							${this.incompleteOpen ? html`
							<uui-table>
								<uui-table-head>
									<uui-table-head-cell>Impact</uui-table-head-cell>
									<uui-table-head-cell>Title</uui-table-head-cell>
									<uui-table-head-cell>Description</uui-table-head-cell>
									<uui-table-head-cell>Accessibility Standard</uui-table-head-cell>
									<uui-table-head-cell>Violations</uui-table-head-cell>
									<uui-table-head-cell>Action</uui-table-head-cell>
								</uui-table-head>
								${this.results.incomplete.map((result: any) => html`
								<uui-table-row @click="${()=>this.openDetail(result)}" style="cursor: pointer;">
									<uui-table-cell><uui-tag color="${AccessibilityReporterService.impactToTag(result.impact)}" look="primary">${AccessibilityReporterService.upperCaseFirstLetter(result.impact)}</uui-tag></uui-table-cell>
									<uui-table-cell>${result.help}</uui-table-cell>
									<uui-table-cell>${result.description}</uui-table-cell>
									<uui-table-cell>
										${AccessibilityReporterService.mapTagsToStandard(result.tags).map((tag: any) => html`
											<uui-tag color="default" look="outline" class="c-tag">${tag}</uui-tag>
										`)}
									</uui-table-cell>
									<uui-table-cell><div class="c-incident-number c-incident-number--${result.impact}"><div class="c-incident-number__text">${result.nodes.length}</div></div></uui-table-cell>
									<uui-table-cell>
										<button type="button" class="c-detail-button">
											<span class="c-detail-button__group">
												<uui-icon-registry-essential>
													<uui-icon name="see"></uui-icon>
												</uui-icon-registry-essential>
												<span class="c-detail-button__text">
													View Details <span class="sr-only">about ${result.help}</span>
												</span>
											</span>
										</button>
									</uui-table-cell>
								</uui-table-row>
								`)}
							</uui-table>`
						: null}
						</div>
					</div>
					`: html`<p>All automated tests ran successfully.</p>`}
				</uui-box>

				<uui-box style="margin-bottom: 20px;">
					<button type="button" slot="headline" class="c-accordion-header" @click="${this.togglePasses}" aria-expanded="${this.passesOpen === true}" id="passesAccordion">
						<div class="c-title__group">
							${this.results.passes.length ? html` <div class="c-circle c-circle--passed"><div class="c-circle__text">${this.results.passes.length}</div></div>` : null}
							<h2 class="c-accordion-header__title c-title">
								Passed Test${this.results.passes.length !== 1 ? html`s` : null}
								${this.results.passes.length ?
								html`
									${this.passesOpen ?
									html`<uui-symbol-expand open></uui-symbol-expand>`
									: html`<uui-symbol-expand></uui-symbol-expand>`
								}
								`
					: null}
							</h2>
						</div>
					</button>
					<p>All these tests have passed successfully! High 5, you rock!</p>
					<div class="c-table__container" role="region" aria-labelledby="passesAccordion">
						${this.passesOpen ? html`
						<uui-table>
							<uui-table-head>
								<uui-table-head-cell>Impact</uui-table-head-cell>
								<uui-table-head-cell>Title</uui-table-head-cell>
								<uui-table-head-cell>Description</uui-table-head-cell>
								<uui-table-head-cell>Accessibility Standard</uui-table-head-cell>
								<uui-table-head-cell>Elements</uui-table-head-cell>
							</uui-table-head>
							${this.results.passes.map((result: any) => html`
							<uui-table-row>
								<uui-table-cell><uui-tag color="positive" look="primary" class="c-uui-tag--positive">Passed</uui-tag></uui-table-cell>
								<uui-table-cell>${result.help}</uui-table-cell>
								<uui-table-cell>${result.description}</uui-table-cell>
								<uui-table-cell>
									${AccessibilityReporterService.mapTagsToStandard(result.tags).map((tag: any) => html`
										<uui-tag color="default" look="outline" class="c-tag">${tag}</uui-tag>
									`)}
								</uui-table-cell>
								<uui-table-cell>${result.nodes.length}</uui-table-cell>
							</uui-table-row>
							`)}
						</uui-table>
						`: null}
					</div>
				</uui-box>

				${this.history.length > 0 ? html`
					<uui-box style="margin-bottom: 20px;">
						<div slot="headline" class="c-title__group">
							<div class="c-circle">
								<uui-icon name="icon-history" aria-hidden="true"></uui-icon>
							</div>
							<h2 class="c-title">History</h2>
						</div>
						<div class="c-history">
							<div class="c-history__item">
								<uui-table>
									<uui-table-head>
										<uui-table-head-cell>Date</uui-table-head-cell>
										<uui-table-head-cell>Score</uui-table-head-cell>
										<uui-table-head-cell>Passed</uui-table-head-cell>
										<uui-table-head-cell>Failed</uui-table-head-cell>
										<uui-table-head-cell>Incomplete</uui-table-head-cell>
									</uui-table-head>
									${this._getHistoryPage().map((run: TestRun) => html`
									<uui-table-row>
										<uui-table-cell>${format(run.runCompleted, "MMMM do yyyy HH:mm:ss")}</uui-table-cell>
										<uui-table-cell>${run.score}</uui-table-cell>
										<uui-table-cell>${run.passedCount}</uui-table-cell>
										<uui-table-cell>${run.failedCount}</uui-table-cell>
										<uui-table-cell>${run.incompleteCount}</uui-table-cell>
									</uui-table-row>
									`)}
								</uui-table>
								<umb-pagination
									page-number="${this._historyPagination.currentPage}"
									total-pages="${this._historyPagination.totalPages}"
									on-next="${this._changeHistoryPage.bind(this)}"
									on-prev="${this._changeHistoryPage.bind(this)}"
									on-change="${this._changeHistoryPage.bind(this)}"
									on-go-to-page="${this._changeHistoryPage.bind(this)}">
								</umb-pagination>
								<uui-button look="secondary" color="default" @click="${this.exportHistory}" label="Export history as an xlsx file" class="c-summary__button">Export history</uui-button>
							</div>
							<div class="c-history__item">
								<ar-score-history .history="${this.history}"></ar-score-history>
							</div>
						</div>
					</uui-box>
				`: null}

				<uui-box>
					<div slot="headline" class="c-title__group">
						<div class="c-circle">
							<svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" width="18" height="18" viewBox="0 0 500 500"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="2.613" stroke-width="30"><path d="M201.404 415.551H450M201.404 250H450M201.404 84.45H450M129.745 118.506c0 3.213-2.603 5.798-5.815 5.798M123.93 124.305H55.815M55.815 124.305A5.799 5.799 0 0 1 50 118.507M50 118.506V50.445M50 50.445c0-3.231 2.603-5.851 5.815-5.851M55.815 44.595h68.115M123.93 44.595c3.213 0 5.815 2.62 5.815 5.851M129.745 50.445v68.061M129.745 284.074a5.79 5.79 0 0 1-5.815 5.799M123.93 289.873H55.815M55.815 289.873A5.787 5.787 0 0 1 50 284.074M50 284.074v-68.095M50 215.979c0-3.231 2.603-5.851 5.815-5.851M55.815 210.128h68.115M123.93 210.128c3.213 0 5.815 2.619 5.815 5.851M129.745 215.979v68.095M129.745 449.607c0 3.248-2.603 5.798-5.815 5.798M123.93 455.405H55.815M55.815 455.405c-3.213 0-5.815-2.55-5.815-5.798M50 449.607v-68.079M50 381.528c0-3.213 2.603-5.833 5.815-5.833M55.815 375.695h68.115M123.93 375.695c3.213 0 5.815 2.62 5.815 5.833M129.745 381.528v68.079" /></g></svg>
						</div>
						<h2 class="c-title">Manual Tests</h2>
					</div>
					<p class="c-paragraph">Automated accessibility tests can only catch up to <strong>37% of accessibility issues</strong>. Manual testing is needed to ensure that this page is fully accessible.</p>
					<p class="c-paragraph__spaced">As a minimum it is recommended that the following manual tests are run on <a href="${this.testURL}" target="_blank" class="btn-link -underline c-bold">${this.pageName}<span class="sr-only"> (opens in a new window)</span></a> every time that the automated tests are run.</p>
					<div class="c-checklist">
						<div class="c-checklist__item">
							<uui-toggle label="All interactive elements can be reached using keyboard controls."></uui-toggle>
						</div>
						<div class="c-checklist__item">
							<uui-toggle label="Tab order is consistent with how it visually appears on the page."></uui-toggle>
						</div>
						<div class="c-checklist__item">
							<uui-toggle label="There are no keyboard traps on elements that shouldn't be trapping focus."></uui-toggle>
						</div>
						<div class="c-checklist__item">
							<uui-toggle label="Interactive elements have a clear focus style."></uui-toggle>
						</div>
						<div class="c-checklist__item">
							<uui-toggle label="Input focus does not change unexpectedly without user initiating it."></uui-toggle>
						</div>
						${this.results.incomplete.length ? html`
						<div class="c-checklist__item">
							<uui-toggle label="Incomplete automated tests in the 'Incomplete Tests' section have passed."></uui-toggle>
						</div>
						` : null}
					</div>
				</uui-box>
				</div>
			`;
		}
	}


	static styles = [
		generalStyles,
		css`
      :host {
        display: block;
        padding: 24px;
      }
      .c-trend {
        display: block;
        font-size: 0.875rem;
        font-weight: bold;
        margin-top: 4px;
      }
      .c-trend--improved { color: #3d8f3d; }
      .c-trend--worsened { color: #c0392b; }
      .c-trend--same { color: #888; }
    `,
	];
}

export default AccessibilityReporterWorkspaceViewElement;

declare global {
	interface HTMLElementTagNameMap {
		'accessibility-reporter-workspaceview': AccessibilityReporterWorkspaceViewElement;
	}
}
