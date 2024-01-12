import { LitElement, html, customElement, state, ifDefined, css } from "@umbraco-cms/backoffice/external/lit";
//import { UMB_AUTH, UmbLoggedInUser } from '@umbraco-cms/backoffice/auth';
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
//import { UMB_NOTIFICATION_CONTEXT_TOKEN, UmbNotificationContext } from '@umbraco-cms/backoffice/notification';

import AccessibilityReporterService from "./services/accessibility-reporter.service";
import AccessibilityReporterAPIService from "./services/accessibility-reporter-api.service";

import "./components/ar-chart";
import "./components/ar-score";
import "./components/ar-pre-test";
import "./components/ar-running-tests";
import "./components/ar-has-results";

import PageState from "./enums/page-state";
import IConfig from "./interface/IConfig";
import IResults from "./interface/IResults";
import ITestPage from "./interface/ITestPage";

import { generalStyles } from "./styles/general";
import IPageResult from "./interface/IPageResult";

@customElement("accessibility-reporter-dashboard")
export class AccessibilityReporterDashboardElement extends UmbElementMixin(LitElement) {

	private dashboardStorageKey = "AR.Dashboard";

	@state()
	private config: IConfig;

	@state()
	private pageState: PageState;

	@state()
	private currentTestUrl: string;

	@state()
	private results: IResults | undefined;

	@state()
	private currentTestNumber: number | undefined;

	@state()
	private testPages: ITestPage[];

	//@state()
	//private currentUser?: UmbLoggedInUser;

	//private auth?: typeof UMB_AUTH.TYPE;

	//private _notificationContext?: UmbNotificationContext;

	constructor() {
		super();
		// this.consumeContext(UMB_AUTH, (instance) => {
		// 	this.auth = instance;
		// 	this.observeCurrentUser();
		// });

		// this.consumeContext(UMB_NOTIFICATION_CONTEXT_TOKEN, (_instance) => {
		// 	this._notificationContext = _instance;
		// });

		this.pageState = PageState.PreTest;

		this.init();

	}

	private async init() {

		this.config = await AccessibilityReporterAPIService.getConfig();
		this.loadDashboard(); 

	}

	// private async observeCurrentUser() {
	// 	if (!this.auth) return;
	// 	this.observe(this.auth.currentUser, (currentUser) => {
	// 		this.currentUser = currentUser;
	// 	});
	// }

	private loadDashboard() {

		const dashboardResultsFromStorage = AccessibilityReporterService.getItemFromSessionStorage(this.dashboardStorageKey);
		if (dashboardResultsFromStorage) {
			this.results = dashboardResultsFromStorage;
			this.pageState = PageState.HasResults;
		}

	}

	private async getTestUrls() {
		const pages = await AccessibilityReporterAPIService.getPages(); 
		this.testPages = pages;
		return pages;
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

		const testTimeout = this.config.apiUrl ? 30000 : 10000;
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
			await this.getTestUrls();
		} catch (error) {
			console.error(error);
			return;
		}

		var testResults = [];
		for (let index = 0; index < this.testPages.length; index++) {
			const currentPage = this.testPages[index];
			try {
				this.currentTestNumber = index + 1;
				const result = await this.runSingleTest(currentPage) as IPageResult;
				console.log(result);
				testResults.push(result);
				if (this.pageState !== PageState.RunningTests) {
					break;
				}
			} catch (error) {
				console.error(error);
				continue;
			}
		}


		if (this.pageState !== PageState.RunningTests) {
			return;
		}

		this.results = {
			startTime: startTime,
			endTime: new Date(),
			pages: testResults
		};
		AccessibilityReporterService.saveToSessionStorage(this.dashboardStorageKey, this.results as object);
		this.pageState = PageState.HasResults;
	}

	private async getTestResult(testUrl: string) {
		// TODO: Change when API is working
		return AccessibilityReporterService.runTest(this.shadowRoot, testUrl, true);
		//return this.config.apiUrl ? AccessibilityReporterApiService.getIssues(this.config, testUrl, this.currentUser?.languageIsoCode) : AccessibilityReporterService.runTest(this.shadowRoot, testUrl, true);
	}

	private reduceTestResult(testResult: any) {
		const { inapplicable, incomplete, passes, testEngine, testEnvironment, testRunner, toolOptions, url, timestamp, ...resultFormatted } = testResult;

		resultFormatted.violations = resultFormatted.violations.map((violation: any) => {
			return {
				id: violation.id,
				impact: violation.impact,
				tags: violation.tags,
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


	render() {

		if (this.pageState === PageState.PreTest) {
			return html`
				<ar-pre-test .onRunTests=${this.runTests.bind(this)}></ar-pre-test>
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

		if (this.pageState === PageState.HasResults && this.results) {
			console.log(this.results);
			return html`
				<ar-has-results 
				.onRunTests=${this.runTests.bind(this)}
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
		`
	];
}

declare global {
	interface HTMLElementTagNameMap {
		"accessibility-reporter-dashboard": AccessibilityReporterDashboardElement;
	}
} 
