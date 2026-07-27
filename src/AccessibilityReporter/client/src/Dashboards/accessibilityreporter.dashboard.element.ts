import { LitElement, css, html, customElement, state, ifDefined } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import { UMB_CURRENT_USER_CONTEXT, UmbCurrentUserModel } from '@umbraco-cms/backoffice/current-user';
import { tryExecute } from '@umbraco-cms/backoffice/resources';
import { UMB_NOTIFICATION_CONTEXT, UmbNotificationContext } from "@umbraco-cms/backoffice/notification";
import { AccessibilityReporterAppSettings, ConfigService, DirectoryService, NodeSummaryReadable } from '../api';
import { UmbLanguageCollectionRepository } from '@umbraco-cms/backoffice/language';
import type { UmbLanguageDetailModel } from '@umbraco-cms/backoffice/language';

import AccessibilityReporterService, { AR_BRIDGE_PRESENCE_TIMEOUT_MS, AR_BRIDGE_RESULTS_TIMEOUT_MS } from "../Services/accessibility-reporter.service";

import "../Components/ar-chart";
import "../Components/ar-score";
import "../Components/ar-pre-test";
import "../Components/ar-errored";
import "../Components/ar-running-tests";
import "../Components/ar-has-results";

import PageState from "../Enums/page-state";
import IResults from "../Interface/IResults";

import { generalStyles } from "../Styles/general";
import IPageResult from "../Interface/IPageResult";
import AccessibilityReporterAPIService from "../Services/accessibility-reporter-api.service";

@customElement('accessibility-reporter-dashboard')
export class AccessibilityReporterDashboardElement extends UmbElementMixin(LitElement) {

	private DASHBOARD_STORAGE_KEY = "AR.Dashboard";

	@state()
	private pageState: PageState;

	@state()
	private currentTestUrl: string;

	@state()
	private results: IResults | undefined;

	@state()
	private currentTestNumber: number | undefined;

	@state()
	private testPages: NodeSummaryReadable[];

	@state()
	config: AccessibilityReporterAppSettings | undefined;

	@state()
	currentUser: UmbCurrentUserModel | undefined;

	@state()
	private _availableLanguages: UmbLanguageDetailModel[] = [];

	@state()
	private _selectedCulture: string = '';

		private _notificationContext?: UmbNotificationContext;

	constructor() {
		super();
		this.pageState = PageState.PreTest;
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

		this.consumeContext(UMB_NOTIFICATION_CONTEXT, (_instance) => {
			this._notificationContext = _instance;
		});

		this.config = await this.getConfig();

		/* Expose config to child iframe for tests */
		/*@ts-ignore*/
		window.ACCESSIBILITY_REPORTER_CONFIG = this.config;

		this._fetchLanguages();
		this.loadDashboard();

	}

	private async _fetchLanguages() {
		try {
			const languageRepo = new UmbLanguageCollectionRepository(this);
			const { data } = await languageRepo.requestCollection({ skip: 0, take: 100 });
			if (data?.items && data.items.length > 1) {
				this._availableLanguages = data.items;
				const defaultLang = data.items.find(l => l.isDefault);
				this._selectedCulture = defaultLang?.unique ?? data.items[0]?.unique ?? '';
			}
		} catch {
			// Language picker is optional — ignore errors
		}
	}

	private _handleCultureChange(culture: string) {
		this._selectedCulture = culture;
	}

	private loadDashboard() {

		const dashboardResultsFromStorage = AccessibilityReporterService.getItemFromLocalStorage(this.DASHBOARD_STORAGE_KEY);
		if (dashboardResultsFromStorage) {
			this.results = dashboardResultsFromStorage;
			this.pageState = PageState.HasResults;

			if (this.results &&
				this.results.endTime &&
				new Date(this.results.endTime).getTime() < Date.now() - 7 * 24 * 60 * 60 * 1000) {
				this._notificationContext?.peek('danger', { data: { message: 'The results shown are older than 7 days. Please run a new test to get the latest results.' } });
			}
		}

	}

	private async runSingleTest(page: any) {

		const testRun = new Promise(async (resolve, reject) => {

			try {
				this.currentTestUrl = page.url;
				const currentResult = await this.getTestResult(page.url);
				let resultFormatted = this.reduceTestResult(currentResult);
				resultFormatted.score = AccessibilityReporterService.getPageScore(resultFormatted);
				resultFormatted.page = page;
				resolve(resultFormatted);
			} catch (error) {
				reject(error);
			}
		});

		// The non-apiUrl budget must comfortably exceed the bridge's own worst case (presence +
		// results timeouts) - otherwise this outer race would kill a legitimately in-progress
		// cross-origin/bridge test before it gets the chance to finish.
		const testTimeout = this.config?.apiUrl ? 30000 : (AR_BRIDGE_PRESENCE_TIMEOUT_MS + AR_BRIDGE_RESULTS_TIMEOUT_MS + 2000);
		const timer = new Promise((_resolve, reject) => setTimeout(() => reject("Test run exceeded timeout"), testTimeout));

		return await Promise.race([testRun, timer]);
	}

	private async runTests() {
		this.pageState = PageState.RunningTests;
		this.results = undefined;
		this.currentTestUrl = "";
		this.currentTestNumber = undefined;
		//this.pagesTestResults = [];
		this.testPages = [];

		const startTime = new Date();

		try {
			await this.getTestPages();
		} catch (error) {
			console.error(error);
			return;
		}

		if (!this.testPages) {
			console.log('error', this.testPages);
			this.pageState = PageState.Errored;
			return;
		}

		var testResults = [];
		for (let index = 0; index < this.testPages.length; index++) {
			const currentPage = this.testPages[index];
			try {
				this.currentTestNumber = index + 1;
				const result = await this.runSingleTest(currentPage) as IPageResult;
				testResults.push(result);
				if (this.pageState !== PageState.RunningTests) {
					break;
				}
			} catch (error) {
				continue;
			}
		}

		if(!testResults.length) {
			console.log('error test results', testResults);
			this.pageState = PageState.Errored;
			return;
		}


		if (this.pageState !== PageState.RunningTests) {
			return;
		}

		this.results = {
			startTime: startTime,
			endTime: new Date(),
			pages: testResults,
			culture: this._selectedCulture || undefined
		};
		AccessibilityReporterService.saveToLocalStorage(this.DASHBOARD_STORAGE_KEY, this.results as object);
		this.pageState = PageState.HasResults;
	}

	private async getTestResult(testUrl: string) {
		return this.config?.apiUrl ? AccessibilityReporterAPIService.getIssues(this.config, testUrl, this.currentUser?.languageIsoCode ?? "") : AccessibilityReporterService.runTest(this.shadowRoot, testUrl, true, this.config?.testsToRun ?? []);
	}

	private reduceTestResult(testResult: any) {
		const { inapplicable, incomplete, passes, testEngine, testEnvironment, testRunner, toolOptions, url, timestamp, ...resultFormatted } = testResult;

		resultFormatted.violations = resultFormatted.violations.map((violation: any) => {
			return {
				id: violation.id,
				impact: violation.impact,
				tags: violation.tags,
				title: violation.help,
				description: violation.description,
				nodes: violation.nodes.map((node: any) => {
					return {
						impact: node.impact
					}
				})
			}

		});

		return resultFormatted;
	}

	private stopTests() {
		this.pageState = PageState.PreTest;
	}

	private async getTestPages(): Promise<NodeSummaryReadable[] | undefined> {
		const { data, error } = await tryExecute(this, DirectoryService.pages(
			this._selectedCulture ? { query: { culture: this._selectedCulture } } : undefined
		))
		if (error) {
			console.error(error);
			this.pageState = PageState.Errored;
			return undefined;
		}

		if (data) {
			this.testPages = data;
		}

		return data;
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

	render() {
		if (this.pageState === PageState.PreTest) {
			return html`
				<ar-pre-test
					.onRunTests=${this.runTests.bind(this)}
					.availableLanguages=${this._availableLanguages}
					.selectedCulture=${this._selectedCulture}
					.onCultureChange=${this._handleCultureChange.bind(this)}
				></ar-pre-test>
			`;
		}

		if (this.pageState === PageState.RunningTests) {
			return html`
				<ar-running-tests
				.onStopTests=${this.stopTests.bind(this)}
				currentTestUrl=${this.currentTestUrl}
				currentTestNumber=${ifDefined(this.currentTestNumber)}
				testPagesTotal=${this.testPages.length}
				>
					<div id="dashboard-ar-tests" class="c-test-container"></div>
				</ar-running-tests>
			`;
		}

		if (this.pageState === PageState.Errored) {
			return html`
				<ar-errored .onRunTests=${this.runTests.bind(this)}></ar-errored>
			`;
		}

		if (this.pageState === PageState.HasResults && this.results && this.config) {
			return html`
				<ar-has-results
				.onRunTests=${this.runTests.bind(this)}
				.onStartOver=${() => { this.pageState = PageState.PreTest; }}
				.results=${this.results}
				.config=${this.config}
				></ar-has-results>
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

export default AccessibilityReporterDashboardElement;

declare global {
	interface HTMLElementTagNameMap {
		'accessibility-reporter-dashboard': AccessibilityReporterDashboardElement;
	}
}
