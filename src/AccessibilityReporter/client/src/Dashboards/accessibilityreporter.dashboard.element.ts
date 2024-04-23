import { LitElement, css, html, customElement, state, ifDefined } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import { UMB_CURRENT_USER_CONTEXT, UmbCurrentUserModel } from '@umbraco-cms/backoffice/current-user';
import { tryExecuteAndNotify } from '@umbraco-cms/backoffice/resources';
import { AccessibilityReporterAppSettings, ConfigService, DirectoryService, NodeSummary } from '../Api';

import AccessibilityReporterService from "../Services/accessibility-reporter.service";

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
	private testPages: NodeSummary[];

	@state()
	config: AccessibilityReporterAppSettings | undefined;

	@state()
	currentUser: UmbCurrentUserModel | undefined;

	constructor() {
		super();
		this.pageState = PageState.PreTest;
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

		this.config = await this.getConfig();

		/* Expose config to child iframe for tests */
		/*@ts-ignore*/
		window.ACCESSIBILITY_REPORTER_CONFIG = this.config;

		this.loadDashboard();

	}

	private loadDashboard() {

		const dashboardResultsFromStorage = AccessibilityReporterService.getItemFromSessionStorage(this.DASHBOARD_STORAGE_KEY);
		if (dashboardResultsFromStorage) {
			this.results = dashboardResultsFromStorage;
			this.pageState = PageState.HasResults;
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

		const testTimeout = this.config?.apiUrl ? 30000 : 10000;
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
			this.pageState = PageState.Errored;
			return;
		}


		if (this.pageState !== PageState.RunningTests) {
			return;
		}

		this.results = {
			startTime: startTime,
			endTime: new Date(),
			pages: testResults
		};
		AccessibilityReporterService.saveToSessionStorage(this.DASHBOARD_STORAGE_KEY, this.results as object);
		this.pageState = PageState.HasResults;
	}

	private async getTestResult(testUrl: string) {
		return this.config?.apiUrl ? AccessibilityReporterAPIService.getIssues(this.config, testUrl, this.currentUser?.languageIsoCode ?? "") : AccessibilityReporterService.runTest(this.shadowRoot, testUrl, true);
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

	private async getTestPages(): Promise<NodeSummary[] | undefined> {
		const { data, error } = await tryExecuteAndNotify(this, DirectoryService.pages())
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
		const { data, error } = await tryExecuteAndNotify(this, ConfigService.current())
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

		if (this.pageState === PageState.HasResults && this.results && this.config) {
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
    	`,
	];
}

export default AccessibilityReporterDashboardElement;

declare global {
	interface HTMLElementTagNameMap {
		'accessibility-reporter-dashboard': AccessibilityReporterDashboardElement;
	}
}
