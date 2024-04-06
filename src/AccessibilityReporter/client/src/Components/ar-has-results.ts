import { LitElement, html, customElement, property, state, unsafeHTML } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
//import { UmbModalManagerContext, UMB_MODAL_MANAGER_CONTEXT_TOKEN, UMB_DATA_TYPE_PICKER_MODAL } from '@umbraco-cms/backoffice/modal';

import * as XLSX from 'xlsx';
import moment from "moment";

import './ar-logo';
import './ar-chart';
import './ar-score';

import AccessibilityReporterService from "../Services/accessibility-reporter.service";
import IConfig from "../Interface/IConfig";
import IResults from "../Interface/IResults";

import { generalStyles } from "../Styles/general";
import {UMB_NOTIFICATION_CONTEXT, UmbNotificationContext } from "@umbraco-cms/backoffice/notification";

@customElement("ar-has-results")
export class ARHasResultsElement extends UmbElementMixin(LitElement) {

	@property()
	onRunTests = () => { };

	@property({attribute: false})
	public results: IResults | undefined;

	@property({attribute: false})
	public config: IConfig;

	@state()
	private pageSize = 5;

	@state()
	private currentPage = 1;

	@state()
	private pagesTestResults: any = [];

	@state()
	private totalErrors: number | null = null;

	@state()
	private averagePageScore: number | null = null;

	@state()
	private pageWithLowestScore: any = null;

	@state()
	private numberOfPagesTested: number | null = null;

	@state()
	private mostCommonErrors: any = null;

	@state()
	private totalViolations: number | null = null;

	@state()
	private totalAAAViolations: number | null = null;

	@state()
	private totalAAViolations: number | null = null;

	@state()
	private totalAViolations: number | null = null;

	@state()
	private totalOtherViolations: number | null = null;

	@state()
	private severityChartData: any;

	@state()
	private topViolationsChartData: any;

	@state()
	private pagination: any;

	@state()
	private pagesTestResultsCurrentPage: any;

	@state()
	private reportSummaryText: string = "";

	//#modalManagerContext?: UmbModalManagerContext;

	private _notificationContext?: UmbNotificationContext;

	constructor() {
		super();
		// this.consumeContext(UMB_MODAL_MANAGER_CONTEXT_TOKEN, (instance) => {
		// 	this.#modalManagerContext = instance;
		// 	// modalManagerContext is now ready to be used.

		// 	// const modalContext = this._modalContext?.open({
		// 	// 	type: 'sidebar',
		// 	// 	size: 'small'
		// 	// }, {
		// 	// 	key: 123
		// 	// });
			
		// 	// modalContext?.onSubmit().then((data) => {
		// 	// 		this.value = data.key;
		// 	// }).catch(() => undefined);
		// });

		this.consumeContext(UMB_NOTIFICATION_CONTEXT, (_instance) => {
			this._notificationContext = _instance;
		});
	}

	connectedCallback() {
		super.connectedCallback();
		this.setStats(this.results);
	}

	private formatTime(dateToFormat: Date) {
		return moment(dateToFormat).format(
			"HH:mm:ss"
		);
	}

	private setStats(testResults: any) {
		let totalErrors = 0;
		let allErrors: any = [];

		let totalViolations = 0;
		let totalAViolations = 0;
		let totalAAViolations = 0;
		let totalAAAViolations = 0;
		let totalOtherViolations = 0;

		let pagesTestResults = [];
		for (let index = 0; index < testResults.pages.length; index++) {
			const currentResult = testResults.pages[index];
			totalErrors += currentResult.violations.length;
			allErrors = allErrors.concat(currentResult.violations);

			let totalViolationsForPage = 0;

			for (let indexVoilations = 0; indexVoilations < currentResult.violations.length; indexVoilations++) {
				const currentViolation = currentResult.violations[indexVoilations];
				const violationWCAGLevel = AccessibilityReporterService.getWCAGLevel(currentViolation.tags);
				switch (violationWCAGLevel) {
					case 'AAA':
						totalAAAViolations += currentViolation.nodes.length;
						break;
					case 'AA':
						totalAAViolations += currentViolation.nodes.length;
						break;
					case 'A':
						totalAViolations += currentViolation.nodes.length;
						break;
					case 'Other':
						totalOtherViolations += currentViolation.nodes.length;
						break;
				}
				totalViolations += currentViolation.nodes.length;
				totalViolationsForPage += currentViolation.nodes.length;
			}

			pagesTestResults.push({
				id: currentResult.page.id,
				guid: currentResult.page.guid,
				name: currentResult.page.name,
				url: currentResult.page.url,
				score: currentResult.score,
				violations: totalViolationsForPage
			});
		}

		this.numberOfPagesTested = testResults.pages.length;
		this.totalErrors = totalErrors;

		this.totalViolations = totalViolations;
		this.totalAAAViolations = totalAAAViolations;
		this.totalAAViolations = totalAAViolations;
		this.totalAViolations = totalAViolations;
		this.totalOtherViolations = totalOtherViolations;

		this.reportSummaryText = this.getReportSummaryText();

		this.averagePageScore = this.getAveragePageScore(testResults.pages);
		this.pageWithLowestScore = this.getPageWithLowestScore(testResults.pages);

		const sortedByImpact = allErrors.sort(AccessibilityReporterService.sortIssuesByImpact);
		this.mostCommonErrors = this.getErrorsSortedByViolations(allErrors).slice(0, 6);

		this.pagesTestResults = pagesTestResults.sort(this.sortPageTestResults);

		this.displaySeverityChart(sortedByImpact);
		this.topViolationsChart();

		this.paginateResults();

	}

	private getAveragePageScore(results: any) {
		let totalScore = 0;
		for (let index = 0; index < results.length; index++) {
			const result = results[index];
			totalScore += result.score;
		}
		return Math.round(totalScore / results.length);
	}

	private getPageWithLowestScore(results: any) {
		let lowestScore = 0;
		let pageWithLowestScore = null;
		for (let index = 0; index < results.length; index++) {
			const result = results[index];
			if (!pageWithLowestScore) {
				lowestScore = result.score;
				pageWithLowestScore = result;
				continue;
			}
			if (result.score < lowestScore) {
				lowestScore = result.score;
				pageWithLowestScore = result;
			}
		}

		return pageWithLowestScore;
	}

	private getHighestLevelOfNonCompliance() {
		if (this.totalAAAViolations !== 0) {
			return 'AAA';
		}
		if (this.totalAAViolations !== 0) {
			return 'AA';
		}
		if (this.totalAViolations !== 0) {
			return 'A';
		}
		return null;
	}

	private getReportSummaryText() {
		const highestLevelOfNonCompliance = this.getHighestLevelOfNonCompliance();
		if (highestLevelOfNonCompliance) {
			return `This website <strong>does not</strong> comply with <strong>WCAG ${highestLevelOfNonCompliance}</strong>.`;
		}
		if (this.totalOtherViolations !== 0) {
			return "High 5, you rock! No WCAG violations were found. However, some other issues were found. Please manually test your website to check full compliance.";
		}
		return "High 5, you rock! No WCAG violations were found. Please manually test your website to check full compliance.";
	}

	private displaySeverityChart(sortedAllErrors: any) {

		function countNumberOfTestsWithImpact(errors: any, impact: string) {
			var totalViolationsForForImpact = 0;
			for (let index = 0; index < errors.length; index++) {
				const currentError = errors[index];
				if (currentError.impact === impact) {
					totalViolationsForForImpact += currentError.nodes.length;
				}
			}
			return totalViolationsForForImpact;
		}

		this.severityChartData = {
			labels: [
				'Critical',
				'Serious',
				'Moderate',
				'Minor'
			],
			datasets: [{
				label: 'Violations',
				data: [
					countNumberOfTestsWithImpact(sortedAllErrors, 'critical'),
					countNumberOfTestsWithImpact(sortedAllErrors, 'serious'),
					countNumberOfTestsWithImpact(sortedAllErrors, 'moderate'),
					countNumberOfTestsWithImpact(sortedAllErrors, 'minor')
				],
				backgroundColor: [
					'rgb(120,0,0)',
					'rgb(212, 32, 84)',
					'rgb(250, 214, 52)',
					'rgb(49, 68, 142)'
				],
				hoverOffset: 4,
				rotation: 0
			}],
			patterns: [
				'',
				'diagonal',
				'zigzag-horizontal',
				'dot'
			]
		};
	}

	private topViolationsChart() {
		this.topViolationsChartData = {
			labels: this.mostCommonErrors.map((error: any) => error.id.replaceAll('-', ' ').replace(/(^\w{1})|(\s+\w{1})/g, (letter: string) => letter.toUpperCase())),
			datasets: [{
				label: 'Violations',
				data: this.mostCommonErrors.map((error: any) => error.errors),
				backgroundColor: [
					'rgba(255, 99, 132, 1)',
					'rgba(255, 159, 64, 1)',
					'rgba(255, 205, 86, 1)',
					'rgba(75, 192, 192, 1)',
					'rgba(54, 162, 235, 1)',
					'rgba(153, 102, 255, 1)',
					'rgba(201, 203, 207, 1)'
				]
			}]
		};
	}



	private getErrorsSortedByViolations(errors: any) {

		let allErrors: any = [];
		for (let index = 0; index < errors.length; index++) {
			const currentError = errors[index];
			if (!allErrors.some((error: any) => error.id === currentError.id)) {
				allErrors.push({
					id: currentError.id,
					errors: currentError.nodes.length
				});
			} else {
				const errorIndex = allErrors.findIndex(((error: any) => error.id == currentError.id));
				allErrors[errorIndex].errors += currentError.nodes.length;
			}
		}

		const sortedAllErrors = allErrors.sort((a: any, b: any) => b.errors - a.errors);
		return sortedAllErrors;
	}

	private sortPageTestResults(a: any, b: any) {
		if (a.score === b.score) {
			return b.violations - a.violations;
		}
		if (a.score < b.score) {
			return -1;
		}
		if (a.score > b.score) {
			return 1;
		}
		return 0;
	}


	private showViolationsForLevel(level: any) {
		for (let index = 0; index < this.config.testsToRun.length; index++) {
			const currentLevel = this.config.testsToRun[index];
			if (currentLevel.endsWith(`2${level}`) ||
				currentLevel.endsWith(`21${level}`) ||
				currentLevel.endsWith(`22${level}`)) {
				return true;
			}
		}
		return false;;
	}

	private openDetail(id: any) {

		//const modalContext = this.#modalManagerContext?.open(UMB_DATA_TYPE_PICKER_MODAL);
		console.log(id);

		// editorService.contentEditor({
		// 	id: id,
		// 	submit: function (model) {
		// 		editorService.close();
		// 	},
		// 	close: function () {
		// 		editorService.close();
		// 	}
		// });

	}

	private getDataForPagination(array: any, page_size: any, page_number: any) {
		return array.slice((page_number - 1) * page_size, page_number * page_size);
	}

	private paginateResults() {
		this.pagination = this.paginate(this.pagesTestResults.length, this.currentPage, this.pageSize);
		this.pagesTestResultsCurrentPage = this.getDataForPagination(this.pagesTestResults, this.pageSize, this.currentPage);
		console.log(this.pagesTestResultsCurrentPage);
	}

	private changePage(pageNumber: number) {
		this.currentPage = pageNumber;
		this.paginateResults();
	}

	private paginate(totalItems: number, currentPage: number, pageSize: number) {
		let totalPages = Math.ceil(totalItems / pageSize);
		if (currentPage < 1) {
			currentPage = 1;
		} else if (currentPage > totalPages) {
			currentPage = totalPages;
		}
		return {
			currentPage: currentPage,
			totalPages: totalPages
		};
	}

	private formatPageResultsForExport() {
		const resultsArray = [["Name", "URL", "Score", "Violations"]];
		for (let index = 0; index < this.pagesTestResults.length; index++) {
			const page = this.pagesTestResults[index];
			resultsArray.push([
				page.name,
				page.url,
				page.score,
				page.violations
			]);
		}

		return resultsArray;
	}

	private exportResults() {

		if (!this.results) {
			return;
		}

		try {

			const resultsFormatted = this.formatPageResultsForExport();
			const resultsWorksheet = XLSX.utils.aoa_to_sheet(resultsFormatted);

			const workbook = XLSX.utils.book_new();
			XLSX.utils.book_append_sheet(workbook, resultsWorksheet, "Results");

			const nameWidth = this.pagesTestResults.reduce((w: any, r: any) => Math.max(w, r.name.length), 40);
			const urlWidth = this.pagesTestResults.reduce((w: any, r: any) => Math.max(w, r.url.length), 40);
			resultsWorksheet["!cols"] = [{ width: nameWidth }, { width: urlWidth }, { width: 12 }, { width: 12 }];

			// TODO: move away from moment
			XLSX.writeFile(workbook,
				AccessibilityReporterService.formatFileName(`website-accessibility-report-${moment(this.results.endTime)
					.format("DD-MM-YYYY")}`) + ".xlsx", { compression: true });

		} catch (error) {
			console.error(error);
			this._notificationContext?.peek('danger', { data: { message: 'An error occurred exporting the report. Please try again later.' } });
		}

	};

	render() {
		return html`
		<uui-scroll-container>
			<div class="c-dashboard-grid">

					<uui-box class="c-dashboard-grid__full-row">
						<div slot="headline">
							<h1 class="c-title">Accessibility Report</h1>
						</div>
						<div>
							<p>${unsafeHTML(this.reportSummaryText)}</p>
							<div class="c-summary__container">
								${this.showViolationsForLevel('a') ?
				html`
								<div class="c-summary ${this.totalAViolations ? "c-summary--error" : ""} ${!this.totalAViolations ? "c-summary--info" : ""}">
									<div class="c-summary__circle">
										${AccessibilityReporterService.formatNumber(this.totalAViolations || 0)}
										<span class="c-summary__title">A Issues</span>
									</div>
								</div>
								` : null}
								${this.showViolationsForLevel('aa') ?
				html`
									<div class="c-summary ${this.totalAAViolations ? "c-summary--error" : ""} ${!this.totalAAViolations ? "c-summary--info" : ""}">
										<div class="c-summary__circle">
											${AccessibilityReporterService.formatNumber(this.totalAAViolations || 0)}
											<span class="c-summary__title">AA Issues</span>
										</div>
									</div>
								` : null}
								${this.showViolationsForLevel('aaa') ?
				html`
									<div class="c-summary ${this.totalAAAViolations ? "c-summary--error" : ""} ${!this.totalAAAViolations ? "c-summary--info" : ""}">
										<div class="c-summary__circle">
											${AccessibilityReporterService.formatNumber(this.totalAAAViolations || 0)}
											<span class="c-summary__title">AAA Issues</span>
										</div>
									</div>
								` : null}
								<div class="c-summary ${this.totalOtherViolations ? "c-summary--error" : ""} ${!this.totalOtherViolations ? "c-summary--info" : ""}">
									<div class="c-summary__circle">
										${AccessibilityReporterService.formatNumber(this.totalOtherViolations || 0)}
										<span class="c-summary__title">Other Issues</span>
									</div>
								</div>
							</div>
							<uui-button look="primary" color="default" @click="${this.onRunTests}" label="Rerun full website accessibility tests" class="c-summary__button">Rerun tests</uui-button>
							<uui-button look="secondary" color="default" @click="${this.exportResults}" label="Export accessibility test results as an xlsx file" class="c-summary__button">Export results</uui-button>
							${this.results ?
				html`<span class="c-summary__time">Started at <strong>${this.formatTime(this.results.startTime)}</strong> and ended at <strong>${this.formatTime(this.results.endTime)}</strong></span>`
				: null}
						</div>
					</uui-box>

					<uui-box ng-if="totalViolations">
						<div slot="headline">
							<h2 class="c-title">Total Violations</h2>
						</div>
						<p class="c-dashboard-number">${AccessibilityReporterService.formatNumber(this.totalViolations || 0)}</p>
						<p class="c-dashboard-number__info">Across ${AccessibilityReporterService.formatNumber(this.totalErrors || 0)} different failed tests</p>
					</uui-box>

					<uui-box ng-if="averagePageScore">
						<div slot="headline">
							<h2 class="c-title">Average Page Score</h2>
						</div>
						<div>
							<ar-score score="${this.averagePageScore || 0}" hideScoreText large></ar-score>
							<p class="c-dashboard-number__info">${AccessibilityReporterService.formatNumber(this.numberOfPagesTested || 0)} pages tested</p>
						</div>
					</uui-box>

					<uui-box ng-if="pageWithLowestScore">
						<div slot="headline">
							<h2 class="c-title">Lowest Page Score</h2>
						</div>
						<div>
							<ar-score score="${this.pageWithLowestScore.score || 0}" hideScoreText large></ar-score>
							<p class="c-dashboard-number__info">${this.pageWithLowestScore.page.name}</p>
						</div>
					</uui-box>

					<uui-box ng-if="totalViolations">
						<div slot="headline">
							<h2 class="c-title">Violation Severity</h2>
						</div>
						<ar-chart .data="${this.severityChartData}" type="pie" width="300" height="300"></ar-chart> 
					</uui-box>

					<uui-box ng-if="totalViolations" class="c-dashboard-grid__23">
						<div slot="headline">
							<h2 class="c-title">Top Violations</h2>
						</div>
						<ar-chart .data="${this.topViolationsChartData}" type="bar" width="600" height="300"></ar-chart>
					</uui-box>

					<uui-box class="c-dashboard-grid__full-row" ng-if="pagesTestResultsCurrentPage.length">
						<div slot="headline">
							<h2 class="c-title">Pages Sorted By Lowest Score</h2>
						</div>
						<uui-table>
							<uui-table-head>
								<uui-table-head-cell>Name</uui-table-head-cell>
								<uui-table-head-cell>URL</uui-table-head-cell>
								<uui-table-head-cell>Score</uui-table-head-cell>
								<uui-table-head-cell>Violations</uui-table-head-cell>
								<uui-table-head-cell>Action</uui-table-head-cell>
							</uui-table-head>
							${this.pagesTestResultsCurrentPage.map((page: any) =>
					html`<uui-table-row>
								<uui-table-cell>${page.name}</uui-table-cell>
								<uui-table-cell><a href="${page.url}" target="_blank">${page.url} <span class="sr-only">Opens in a new window</span></a></uui-table-cell>
								<uui-table-cell>${page.score}</uui-table-cell>
								<uui-table-cell>${page.violations}</uui-table-cell>
								<uui-table-cell>
									<!-- <button type="button" class="c-detail-button c-detail-button--active" @click="${this.openDetail.bind(page.id)}">
										<span class="c-detail-button__group">
											<uui-icon-registry-essential>
												<uui-icon name="see"></uui-icon>
											</uui-icon-registry-essential>
											<span class="c-detail-button__text">
												View Page
											</span>
										</span>
									</button> -->
									<a href="/section/content/workspace/document/edit/${page.guid}" class="c-detail-button c-detail-button--active">
										<span class="c-detail-button__group">
											<uui-icon-registry-essential>
												<uui-icon name="see"></uui-icon>
											</uui-icon-registry-essential>
											<span class="c-detail-button__text">
												View Page
											</span>
										</span>
									</a>
								</uui-table-cell>
							</uui-table-row>`
				)}
						</uui-table>
						<umb-pagination
							page-number="${this.pagination.currentPage}"
							total-pages="${this.pagination.totalPages}"
							on-next="${this.changePage}"
							on-prev="${this.changePage}"
							on-change="${this.changePage}"
							on-go-to-page="${this.changePage}">
						</umb-pagination>
					</uui-box>

				</div>
			</uui-scroll-container>
		`;
	}

	static styles = [
		generalStyles
	];
}

declare global {
	interface HTMLElementTagNameMap {
		"ar-has-results": ARHasResultsElement;
	}
}