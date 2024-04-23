import { LitElement, css, html, customElement, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import { format } from 'date-fns'
import PageState from "../Enums/page-state";
import { UMB_CURRENT_USER_CONTEXT, UmbCurrentUserModel } from "@umbraco-cms/backoffice/current-user";
import { UMB_DOCUMENT_WORKSPACE_CONTEXT, UmbDocumentWorkspaceContext } from '@umbraco-cms/backoffice/document';
import { tryExecuteAndNotify } from "@umbraco-cms/backoffice/resources";
import { AccessibilityReporterAppSettings, ConfigService } from "../Api";
import { MediaUrlInfoModel } from "@umbraco-cms/backoffice/external/backend-api";
import { generalStyles } from "../Styles/general";
import AccessibilityReporterAPIService from "../Services/accessibility-reporter-api.service";
import AccessibilityReporterService from "../Services/accessibility-reporter.service";
import { UMB_MODAL_MANAGER_CONTEXT } from "@umbraco-cms/backoffice/modal";
import { ACCESSIBILITY_REPORTER_MODAL_DETAIL } from "../Modals/detail/accessibilityreporter.detail.modal.token";
import { utils, writeFile } from "xlsx";
import { UMB_NOTIFICATION_CONTEXT, UmbNotificationContext } from "@umbraco-cms/backoffice/notification";
import '../Components/ar-score';

@customElement('accessibility-reporter-workspaceview')
export class AccessibilityReporterWorkspaceViewElement extends UmbElementMixin(LitElement) {

	@state()
	private pageState: PageState;

	@state()
	config: AccessibilityReporterAppSettings | undefined;

	@state()
	currentUser: UmbCurrentUserModel | undefined;

	@state()
	private _urls?: Array<MediaUrlInfoModel>;

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
	private violationsOpen: boolean = true;

	@state()
	private incompleteOpen: boolean = true;

	@state()
	private passesOpen: boolean = false;

	private _workspaceContext?: typeof UMB_DOCUMENT_WORKSPACE_CONTEXT.TYPE;

	private _modalManagerContext: typeof UMB_MODAL_MANAGER_CONTEXT.TYPE;

	private _notificationContext?: UmbNotificationContext;

	constructor() {
		super();
		this.pageState = PageState.ManuallyRun;
		this.init();
	}

	private async init() {

		this.consumeContext(UMB_CURRENT_USER_CONTEXT, (context) => {
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
            this._modalManagerContext = context;
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

		if(this.config.runTestsAutomatically) {
			this.runTests(false);
		}

	}

	private getLocalHostname() {
		return location.hostname + (location.port ? ":" + location.port : "");
	}

	private getFallbackBaseUrl() {
		return location.protocol + "//" + this.getHostname(this?._urls);
	}

	private getHostname(possibleUrls: any) {
		if (!this.config?.apiUrl) {
			// so we don't get iframe CORS issues
			return this.getLocalHostname();
		}
		for (let index = 0; index < possibleUrls.length; index++) {
			var possibleCurrentUrl = possibleUrls[index].text;
			if (AccessibilityReporterService.isAbsoluteURL(possibleCurrentUrl)) {
				return AccessibilityReporterService.getHostnameFromString(possibleCurrentUrl);
			}
		}
		// fallback if hostnames not set assume current host
		return this.getLocalHostname();
	}

	private _observeContent() {
		if (!this._workspaceContext) return;

		this.pageName = this._workspaceContext.getName() as string;

		this.observe((this._workspaceContext as UmbDocumentWorkspaceContext).urls, (urls) => {
			this._urls = urls;
		});

	}

	private async getConfig(): Promise<AccessibilityReporterAppSettings | undefined> {
		const { data, error } = await tryExecuteAndNotify(this, ConfigService.current())
		if (error) {
			console.error(error);
			this.pageState = PageState.Errored;
			return undefined;
		}

		return data;
	}

	private async getTestResult(testUrl: string, showTestRunning: boolean = true) {
		return this.config?.apiUrl ? AccessibilityReporterAPIService.getIssues(this.config, testUrl, this.currentUser?.languageIsoCode ?? "") : AccessibilityReporterService.runTest(this.shadowRoot, testUrl, showTestRunning);
	}

	private async runTests(showTestRunning: boolean): Promise<void> {

		this.pageState = PageState.Loading;

		const pathToTest = this._urls?.[0].url || "/";
		this.testURL = new URL(pathToTest, this.config?.testBaseUrl).toString();

		try {
			const testResponse = await this.getTestResult(this.testURL, showTestRunning); // TODO: Add types
			this.results = this.sortResponse(testResponse);
			this.score = AccessibilityReporterService.getPageScore(testResponse);
			this.pageState = PageState.Loaded;
			this.testTime = format(testResponse.timestamp, "HH:mm:ss");
			this.testDate = format(testResponse.timestamp, "MMMM do yyyy");
		} catch (error) {
			this.pageState = PageState.Errored;
			console.error(error);
		}

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
		const modal = this._modalManagerContext?.open(this, ACCESSIBILITY_REPORTER_MODAL_DETAIL, {
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

			writeFile(workbook,
				AccessibilityReporterService.formatFileName(`accessibility-report-${this.pageName}-${format(this.results.timestamp, "yyyy-MM-dd")}`) + ".xlsx", { compression: true });

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
				<p>Accessibility Reporter only works for URLs that are accessible publicly.</p>
				<p>If your page is publicly accessible, please try using the "Rerun Tests" button below or refreshing this page to run the accessibility report again.</p>
				<uui-button look="primary" color="default" @click="${this.runTests}" label="Rerun accessibility tests on current published page">Rerun tests</uui-button>
			</uui-box>
			`;
		}

		if (this.pageState === PageState.Loaded) {
			return html`
			<div>
				<uui-box style="margin-bottom: 20px;">

					<div slot="headline" class="c-title__group">
						<svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" style="enable-background:new 0 0 24 24" viewBox="0 0 24 24" width="42" height="42">
						<path d="M12 22c5.5 0 10-4.5 10-10S17.5 2 12 2 2 6.5 2 12s4.5 10 10 10z" style="fill:#ffffff;stroke:#443b52;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round" />
						<path d="m7 9 5 1m5-1-5 1m0 0v3m0 0-2 5m2-5 2 5" style="fill:none;stroke:#443b52;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round" />
						<path d="M12 8.5c-.7 0-1.2-.6-1.2-1.3S11.3 6 12 6s1.2.6 1.2 1.2-.5 1.3-1.2 1.3z" style="fill:#443b52" />
						</svg>
						<h2 class="c-title">Accessibility Report for <a href="${this.testURL}" target="_blank" class="c-title__link">${this.pageName} <span class="sr-only">(opens in a new window)</span></a></h2>
					</div>

					<div class="c-summary__container">
						<div class="c-summary c-summary--issues">
							<ar-score score="${this.score}"></ar-score>
						</div>
						<div class="c-summary c-summary--issues">
							<div class="c-summary__circle">
								${this.results.violations.length}
								<span class="c-summary__title">Failed</span>
							</div>
						</div>
						<div class="c-summary c-summary--incomplete">
							<div class="c-summary__circle">
								${this.results.incomplete.length}
								<span class="c-summary__title">Incomplete</span>
							</div>
						</div>
						<div class="c-summary c-summary--passed">
							<div class="c-summary__circle">
								${this.results.passes.length}
								<span class="c-summary__title">Passed</span>
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
    `,
	];
}

export default AccessibilityReporterWorkspaceViewElement;

declare global {
	interface HTMLElementTagNameMap {
		'accessibility-reporter-workspaceview': AccessibilityReporterWorkspaceViewElement;
	}
}
