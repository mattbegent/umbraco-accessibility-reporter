import { LitElement, html, customElement, property, state, unsafeHTML, css } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";

import { utils } from "xlsx";
import { format } from 'date-fns';

import './ar-logo';
import './ar-chart';
import './ar-score';

import AccessibilityReporterService from "../Services/accessibility-reporter.service";
import IResults from "../Interface/IResults";

import { generalStyles } from "../Styles/general";
import { UMB_NOTIFICATION_CONTEXT, UmbNotificationContext } from "@umbraco-cms/backoffice/notification";
import { AccessibilityReporterAppSettings } from "../api";
import { UMB_CURRENT_USER_CONTEXT, UmbCurrentUserModel } from "@umbraco-cms/backoffice/current-user";
import { UMB_MODAL_MANAGER_CONTEXT } from "@umbraco-cms/backoffice/modal";
import type { UUIPaginationElement } from "@umbraco-cms/backoffice/external/uui";
import { ACCESSIBILITY_REPORTER_MODAL_ISSUE } from "../Modals/issue/accessibilityreporter.issue.modal.token";
import { generateWorkspaceUrl } from "../Services/workspace-url";
import IIssueSummary from "../Interface/IIssueSummary";

const ISSUES_PAGE_SIZE = 10;

@customElement("ar-has-results")
export class ARHasResultsElement extends UmbElementMixin(LitElement) {

	@property()
	onRunTests = () => { };

	@property()
	onStartOver = () => { };

	@property({ attribute: false })
	public results: IResults | undefined;

	@property({ attribute: false })
	public config: AccessibilityReporterAppSettings;

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

	@state()
	private pageUrls: Map<string, string> = new Map();

	@state()
	private _siteNames: string[] = [];

	@state()
	private _selectedSite: string = 'all';

	@state()
	private _filteredResultPages: any[] = [];

	@state()
	private issues: IIssueSummary[] = [];

	@state()
	private issuesPage = 1;

	private _notificationContext?: UmbNotificationContext;

	private _modalManagerContext?: typeof UMB_MODAL_MANAGER_CONTEXT.TYPE;

	@state()
    private _currentUser?: UmbCurrentUserModel;

	constructor() {
		super();
		this.consumeContext(UMB_NOTIFICATION_CONTEXT, (_instance) => {
			this._notificationContext = _instance;
		});
		this.consumeContext(UMB_MODAL_MANAGER_CONTEXT, (instance) => {
			this._modalManagerContext = instance;
		});
		this.consumeContext(UMB_CURRENT_USER_CONTEXT, (instance) => {
			if (!instance) {
				return;
			}
			this._observeCurrentUser(instance);
		});
	}

	  private async _observeCurrentUser(instance: typeof UMB_CURRENT_USER_CONTEXT.TYPE) {
        this.observe(instance.currentUser, (currentUser) => {
            this._currentUser = currentUser;
        });
    }

	connectedCallback() {
		super.connectedCallback();
		this.setStats(this.results);
	}

	private formatTime(dateToFormat: Date) {
		return format(dateToFormat, "HH:mm:ss");
	}

	private setStats(testResults: any) {

		const siteNames: string[] = [];
		for (const result of testResults.pages) {
			if (result.page.rootName && !siteNames.includes(result.page.rootName)) {
				siteNames.push(result.page.rootName);
			}
		}
		this._siteNames = siteNames;

		const filteredPages = this.isMultisite && this._selectedSite !== 'all'
			? testResults.pages.filter((page: any) => page.page.rootName === this._selectedSite)
			: testResults.pages;
		this._filteredResultPages = filteredPages;

		let totalErrors = 0;
		let allErrors: any = [];
		let totalViolations = 0;
		let totalAViolations = 0;
		let totalAAViolations = 0;
		let totalAAAViolations = 0;
		let totalOtherViolations = 0;

		let pagesTestResults = [];
		for (let index = 0; index < filteredPages.length; index++) {
			const currentResult = filteredPages[index];
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
				rootName: currentResult.page.rootName,
				score: currentResult.score,
				violations: totalViolationsForPage
			});
		}

		this.numberOfPagesTested = filteredPages.length;
		this.totalErrors = totalErrors;

		this.totalViolations = totalViolations;
		this.totalAAAViolations = totalAAAViolations;
		this.totalAAViolations = totalAAViolations;
		this.totalAViolations = totalAViolations;
		this.totalOtherViolations = totalOtherViolations;

		this.reportSummaryText = this.getReportSummaryText();

		this.averagePageScore = this.getAveragePageScore(filteredPages);
		this.pageWithLowestScore = this.getPageWithLowestScore(filteredPages);

		const sortedByImpact = allErrors.sort(AccessibilityReporterService.sortIssuesByImpact);
		this.mostCommonErrors = this.getErrorsSortedByViolations(allErrors).slice(0, 6);

		this.pagesTestResults = pagesTestResults.sort(this.sortPageTestResults);

		this.issues = AccessibilityReporterService.getIssueSummaries(filteredPages);
		this.issuesPage = 1;

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

	private get isMultisite(): boolean {
		return this._siteNames.length > 1;
	}

	private _handleSiteFilterChange = (e: Event) => {
		const select = e.target as HTMLSelectElement;
		this._selectedSite = select.value;
		this.currentPage = 1;
		this.setStats(this.results);
	};

	private getReportSummaryText() {
		const isFilteredToSingleSite = this.isMultisite && this._selectedSite !== 'all';
		const siteWord = (this.isMultisite && !isFilteredToSingleSite) ? "these websites" : "this website";
		const doWord = (this.isMultisite && !isFilteredToSingleSite) ? "do" : "does";

		const highestLevelOfNonCompliance = this.getHighestLevelOfNonCompliance();
		if (highestLevelOfNonCompliance) {
			return `${AccessibilityReporterService.upperCaseFirstLetter(siteWord)} <strong>${doWord} not</strong> comply with <strong>WCAG ${highestLevelOfNonCompliance}</strong>.`;
		}
		if (this.totalOtherViolations !== 0) {
			return `High 5, you rock! No WCAG violations were found. However, some other issues were found. Please manually test ${siteWord} to check full compliance.`;
		}
		return `High 5, you rock! No WCAG violations were found. Please manually test ${siteWord} to check full compliance.`;
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
			labels: this.mostCommonErrors.map((error: any) => AccessibilityReporterService.formatRuleId(error.id)),
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

	private getDataForPagination(array: any, page_size: any, page_number: any) {
		return array.slice((page_number - 1) * page_size, page_number * page_size);
	}

	private paginateResults() {
		this.pagination = this.paginate(this.pagesTestResults.length, this.currentPage, this.pageSize);
		this.pagesTestResultsCurrentPage = this.getDataForPagination(this.pagesTestResults, this.pageSize, this.currentPage);
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

	private async handleWorkspaceClick(event: Event, pageGuid: string): Promise<void> {
		event.preventDefault();

		// Check if we already have the URL cached
		if (this.pageUrls.has(pageGuid)) {
			window.location.href = this.pageUrls.get(pageGuid)!;
			return;
		}

		try {
			const url = await this.generateWorkspaceUrl(pageGuid);

			// Cache the URL for future clicks
			const newPageUrls = new Map(this.pageUrls);
			newPageUrls.set(pageGuid, url);
			this.pageUrls = newPageUrls;

			// Navigate to the workspace
			window.location.href = url;

		} catch (error) {
			console.error('Error generating workspace URL:', error);
			// Fallback to invariant URL
			const fallbackUrl = `/umbraco/section/content/workspace/document/edit/${pageGuid}/invariant/view/accessibility-reporter`;
			window.location.href = fallbackUrl;
		}
	}

	private generateWorkspaceUrl(pageGuid: string): Promise<string> {
		return generateWorkspaceUrl(this, pageGuid, this.results?.culture, this.userLanguage);
	}

	private get userLanguage(): string | undefined {
		return this._currentUser?.languageIsoCode ?? undefined;
	}

	private openIssue(issueId: string) {
		const issue = this.issues.find(item => item.id === issueId);
		if (!issue) {
			return;
		}
		this._modalManagerContext?.open(this, ACCESSIBILITY_REPORTER_MODAL_ISSUE, {
			data: {
				issue: issue,
				isMultisite: this.isMultisite,
				culture: this.results?.culture,
				userLanguage: this.userLanguage
			}
		});
	}

	private handleTopViolationSelected(index: number) {
		const error = this.mostCommonErrors?.[index];
		if (error) {
			this.openIssue(error.id);
		}
	}

	private exportResults() {

		if (!this.results) {
			return;
		}

		try {

			const workbook = utils.book_new();
			const multisite = this.isMultisite;

			const pagesRows = this.pagesTestResults.map((page: any) => multisite ? ({
				name: page.name,
				site: page.rootName,
				url: page.url,
				score: page.score,
				violations: page.violations
			}) : ({
				name: page.name,
				url: page.url,
				score: page.score,
				violations: page.violations
			}));

			const pagesWorksheet = utils.json_to_sheet(pagesRows);
			utils.book_append_sheet(workbook, pagesWorksheet, "Pages Summary");

			const pagesHeaders = [multisite
				? ["Name", "Site", "URL", "Accessibility Score", "Total Violations"]
				: ["Name", "URL", "Accessibility Score", "Total Violations"]];
			utils.sheet_add_aoa(pagesWorksheet, pagesHeaders, { origin: "A1" });

			pagesWorksheet["!cols"] = multisite ? [
				{ width: 30 }, // Name
				{ width: 20 }, // Site
				{ width: 40 }, // URL
				{ width: 20 }, // Score
				{ width: 15 }  // Violations
			] : [
				{ width: 30 }, // Name
				{ width: 40 }, // URL
				{ width: 20 }, // Score
				{ width: 15 }  // Violations
			];


			let allViolations: any[] = [];

			this._filteredResultPages.forEach((pageResult: any) => {
				const pageName = pageResult.page.name;
				const pageUrl = pageResult.page.url;
				const siteName = pageResult.page.rootName;

				pageResult.violations.forEach((violation: any) => {
					allViolations.push({
						pageName: pageName,
						...(multisite ? { siteName: siteName } : {}),
						pageUrl: pageUrl,
						impact: violation.impact ? AccessibilityReporterService.upperCaseFirstLetter(violation.impact) : '',
						title: violation.title || '',
						description: violation.description || '',
						standard: AccessibilityReporterService.mapTagsToStandard(violation.tags).join(', '),
						nodeCount: violation.nodes ? violation.nodes.length : 0
					});
				});
			});

			if (allViolations.length > 0) {
				const violationsWorksheet = utils.json_to_sheet(allViolations);
				utils.book_append_sheet(workbook, violationsWorksheet, "All Violations");

				const violationsHeaders = [multisite
					? ["Name", "Site", "URL", "Impact", "Title", "Description", "Accessibility Standard", "Instances"]
					: ["Name", "URL", "Impact", "Title", "Description", "Accessibility Standard", "Instances"]];
				utils.sheet_add_aoa(violationsWorksheet, violationsHeaders, { origin: "A1" });

				const titleWidth = allViolations.reduce((w, r) => Math.max(w, r.title ? r.title.length : 0), 40);
				violationsWorksheet["!cols"] = multisite ? [
					{ width: 25 }, // Name
					{ width: 20 }, // Site
					{ width: 40 }, // URL
					{ width: 10 }, // Impact
					{ width: titleWidth }, // Title
					{ width: 50 }, // Description
					{ width: 25 }, // Standard
					{ width: 10 }  // Count
				] : [
					{ width: 25 }, // Name
					{ width: 40 }, // URL
					{ width: 10 }, // Impact
					{ width: titleWidth }, // Title
					{ width: 50 }, // Description
					{ width: 25 }, // Standard
					{ width: 10 }  // Count
				];
			}

			const siteSuffix = multisite && this._selectedSite !== 'all' ? `-${this._selectedSite}` : '';

			AccessibilityReporterService.downloadWorkbook(workbook,
				AccessibilityReporterService.formatFileName(`${multisite ? "multisite" : "website"}-accessibility-report${siteSuffix}-${format(this.results.endTime, "yyyy-MM-dd")}`) + ".xlsx");

		} catch (error) {
			console.error(error);
			this._notificationContext?.peek('danger', { data: { message: 'An error occurred exporting the report. Please try again later.' } });
		}

	};

	private renderIssuesTable() {
		const totalPages = Math.ceil(this.issues.length / ISSUES_PAGE_SIZE);
		const firstIndex = (this.issuesPage - 1) * ISSUES_PAGE_SIZE;
		const issues = this.issues.slice(firstIndex, firstIndex + ISSUES_PAGE_SIZE);

		return html`
			<uui-box class="c-dashboard-grid__full-row">
				<div slot="headline">
					<h2 class="c-title">Issues</h2>
				</div>
				<p class="c-issues-intro">Every failed test, most severe and widespread first. Select an issue to see the pages it affects and any shared components causing it.</p>
				<div class="c-table__container">
					<uui-table aria-label="Issues">
						<uui-table-head>
							<uui-table-head-cell>Issue</uui-table-head-cell>
							<uui-table-head-cell>Impact</uui-table-head-cell>
							<uui-table-head-cell>Standard</uui-table-head-cell>
							<uui-table-head-cell>Pages</uui-table-head-cell>
							<uui-table-head-cell>Instances</uui-table-head-cell>
							<uui-table-head-cell>Action</uui-table-head-cell>
						</uui-table-head>
						${issues.map(issue => html`
							<uui-table-row>
								<uui-table-cell>
									<div>
										<strong>${AccessibilityReporterService.formatRuleId(issue.id)}</strong>
										<div class="c-issue__title">${issue.title}</div>
										${issue.sharedElements.length ? html`
											<uui-tag look="outline" color="default" class="c-issue__shared">Shared component on ${issue.sharedElements[0].pageCount} pages</uui-tag>
										` : null}
									</div>
								</uui-table-cell>
								<uui-table-cell>
									<uui-tag color="${AccessibilityReporterService.impactToTag(issue.impact)}" look="primary">${AccessibilityReporterService.upperCaseFirstLetter(issue.impact || "")}</uui-tag>
								</uui-table-cell>
								<uui-table-cell>${this.formatWCAGLevel(issue.tags)}</uui-table-cell>
								<uui-table-cell>${AccessibilityReporterService.formatNumber(issue.pages.length)}</uui-table-cell>
								<uui-table-cell>${AccessibilityReporterService.formatNumber(issue.instances)}</uui-table-cell>
								<uui-table-cell>
									<button type="button" @click="${() => this.openIssue(issue.id)}" class="c-detail-button c-detail-button--active">
										<span class="c-detail-button__group">
											<uui-icon-registry-essential>
												<uui-icon name="see"></uui-icon>
											</uui-icon-registry-essential>
											<span class="c-detail-button__text">View Details <span class="sr-only">for ${AccessibilityReporterService.formatRuleId(issue.id)}</span></span>
										</span>
									</button>
								</uui-table-cell>
							</uui-table-row>
						`)}
					</uui-table>
				</div>
				${totalPages > 1 ? html`
					<p class="c-table-status" aria-live="polite">${AccessibilityReporterService.describeRange(firstIndex, issues.length, this.issues.length, 'issue')}</p>
					<div class="c-pagination">
						<uui-pagination
							label="Issues"
							.total=${totalPages}
							.current=${this.issuesPage}
							@change=${(event: Event) => { this.issuesPage = (event.target as UUIPaginationElement).current; }}>
						</uui-pagination>
					</div>
				` : null}
			</uui-box>
		`;
	}

	private formatWCAGLevel(tags: string[]) {
		const level = AccessibilityReporterService.getWCAGLevel(tags);
		return level === 'Other' ? 'Other' : `WCAG ${level}`;
	}

	render() {
		return html`
		<uui-scroll-container>
			<div class="c-dashboard-grid">

					<uui-box class="c-dashboard-grid__full-row">
						<div slot="headline">
							<h1 class="c-title">Accessibility Report${this.results?.culture ? html` <uui-tag look="outline" color="default" style="margin-left: 6px;">${this.results.culture}</uui-tag>` : null}</h1>
						</div>
						<div>
							${this.isMultisite ? html`
							<div class="c-site-filter">
								<label for="ar-site-select" class="c-site-filter__label">Filter by site:</label>
								<select id="ar-site-select" class="c-site-filter__select" .value=${this._selectedSite} @change=${this._handleSiteFilterChange}>
									<option value="all" ?selected=${this._selectedSite === 'all'}>All sites</option>
									${this._siteNames.map(site => html`
										<option value=${site} ?selected=${site === this._selectedSite}>${site}</option>
									`)}
								</select>
							</div>
							` : null}
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
							<uui-button look="primary" color="default" @click="${this.onRunTests}" label="${this.isMultisite ? "Rerun full accessibility tests across all sites" : "Rerun full website accessibility tests"}" class="c-summary__button">Rerun tests</uui-button>
							<uui-button look="secondary" color="default" @click="${this.onStartOver}" label="Change settings and start over" class="c-summary__button">Start over</uui-button>
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
						<ar-chart
							.data="${this.topViolationsChartData}"
							.onSelect="${(index: number) => this.handleTopViolationSelected(index)}"
							type="bar" width="600" height="300"></ar-chart>
						<p class="c-chart-hint">Select a bar to see every page with that issue. All issues are also listed in the Issues table below.</p>
					</uui-box>

					<uui-box class="c-dashboard-grid__full-row" ng-if="pagesTestResultsCurrentPage.length">
						<div slot="headline">
							<h2 class="c-title">Pages Sorted By Lowest Score</h2>
						</div>
						<uui-table>
							<uui-table-head>
								<uui-table-head-cell>Name</uui-table-head-cell>
								${this.isMultisite ? html`<uui-table-head-cell>Site</uui-table-head-cell>` : null}
								<uui-table-head-cell>URL</uui-table-head-cell>
								<uui-table-head-cell>Score</uui-table-head-cell>
								<uui-table-head-cell>Violations</uui-table-head-cell>
								<uui-table-head-cell>Action</uui-table-head-cell>
							</uui-table-head>
							${this.pagesTestResultsCurrentPage.map((page: any) =>
							html`<uui-table-row>
								<uui-table-cell>${page.name}</uui-table-cell>
								${this.isMultisite ? html`<uui-table-cell>${page.rootName}</uui-table-cell>` : null}
								<uui-table-cell><a href="${page.url}" target="_blank">${page.url} <span class="sr-only">Opens in a new window</span></a></uui-table-cell>
								<uui-table-cell>${page.score}</uui-table-cell>
								<uui-table-cell>${page.violations}</uui-table-cell>
								<uui-table-cell>
									<button type="button" @click="${(e: Event) => this.handleWorkspaceClick(e, page.guid)}" class="c-detail-button c-detail-button--active">
										<span class="c-detail-button__group">
											<uui-icon-registry-essential>
												<uui-icon name="see"></uui-icon>
											</uui-icon-registry-essential>
											<span class="c-detail-button__text">
												View Page
											</span>
										</span>
									</button>
								</uui-table-cell>
							</uui-table-row>`
							)}
						</uui-table>
${this.pagination?.totalPages > 1 ? html`
							<p class="c-table-status" aria-live="polite">${AccessibilityReporterService.describeRange((this.pagination.currentPage - 1) * this.pageSize, this.pagesTestResultsCurrentPage.length, this.pagesTestResults.length, 'page')}</p>
							<div class="c-pagination">
								<uui-pagination
									label="Pages sorted by lowest score"
									.total=${this.pagination.totalPages}
									.current=${this.pagination.currentPage}
									@change=${(event: Event) => this.changePage((event.target as UUIPaginationElement).current)}>
								</uui-pagination>
							</div>
						` : null}
					</uui-box>

					${this.issues.length ? this.renderIssuesTable() : null}

				</div>
			</uui-scroll-container>
		`;
	}

	static styles = [
		generalStyles,
		css`
			.c-site-filter {
				display: flex;
				align-items: center;
				gap: 10px;
				margin-bottom: 10px;
			}
			.c-site-filter__label {
				font-size: 14px;
				font-weight: 500;
				white-space: nowrap;
			}
			.c-site-filter__select {
				padding: 6px 10px;
				border: 1px solid var(--uui-color-border, #d8d7d9);
				border-radius: var(--uui-border-radius, 3px);
				background: var(--uui-color-surface, #fff);
				font-size: 14px;
				color: var(--uui-color-text, #1b1b1f);
				cursor: pointer;
			}
			.c-site-filter__select:focus {
				outline: 2px solid var(--uui-color-focus, #3544b1);
				outline-offset: 2px;
			}
			.c-chart-hint {
				font-size: 14px;
				text-align: center;
				margin: 1rem 0 0 0;
			}
			.c-issues-intro {
				margin-top: 0;
			}
			.c-issue__title {
				font-size: 14px;
				margin-top: 2px;
			}
			.c-issue__shared {
				margin-top: 6px;
			}
			.c-pagination {
				display: flex;
				justify-content: center;
			}
			.c-table-status {
				font-size: 14px;
				margin: 1rem 0 0.5rem 0;
			}
		`
	];
}

declare global {
	interface HTMLElementTagNameMap {
		"ar-has-results": ARHasResultsElement;
	}
}
