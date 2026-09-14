import { LitElement, html, customElement, state, css } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import { tryExecute } from "@umbraco-cms/backoffice/resources";
import { format } from 'date-fns';
import { utils } from "xlsx";
import { UmbLanguageCollectionRepository } from '@umbraco-cms/backoffice/language';
import type { UmbLanguageDetailModel } from '@umbraco-cms/backoffice/language';
import { UMB_NOTIFICATION_CONTEXT, UmbNotificationContext } from "@umbraco-cms/backoffice/notification";

import { SiteHistoryService, SiteSummary, SiteTrendPoint } from "../api";
import AccessibilityReporterService from "../Services/accessibility-reporter.service";
import { generalStyles } from "../Styles/general";
import "../Components/ar-chart";

type Trend = 'improved' | 'worsened' | 'same' | null;

// Distinct colours per site line - repeats if there are more sites than colours, which is an
// acceptable degradation rather than a hard cap on how many sites can be compared.
const CHART_COLORS = ['#443b52', '#d42054', '#1C824A', '#f79c37', '#3144ae', '#8e44ad', '#16a085', '#c0392b'];

@customElement('ar-site-history-dashboard')
export class ARSiteHistoryDashboardElement extends UmbElementMixin(LitElement) {

	@state()
	private _sites: SiteSummary[] = [];

	@state()
	private _selectedSiteIds: Set<string> = new Set();

	@state()
	private _trendBySite: Map<string, SiteTrendPoint[]> = new Map();

	@state()
	private _availableLanguages: UmbLanguageDetailModel[] = [];

	@state()
	private _selectedCulture: string = '';

	@state()
	private _loading = false;

	@state()
	private _errored = false;

	private _notificationContext?: UmbNotificationContext;

	constructor() {
		super();
		this.consumeContext(UMB_NOTIFICATION_CONTEXT, (_instance) => {
			this._notificationContext = _instance;
		});
		this.init();
	}

	private async init() {
		await this._fetchLanguages();
		await this._fetchSites();
		await this._fetchTrends();
	}

	private async _fetchLanguages() {
		try {
			const languageRepo = new UmbLanguageCollectionRepository(this);
			const { data } = await languageRepo.requestCollection({ skip: 0, take: 100 });
			if (data?.items && data.items.length > 1) {
				this._availableLanguages = data.items;
			}
		} catch {
			// Language filter is optional - ignore errors
		}
	}

	private async _fetchSites() {
		const { data, error } = await tryExecute(this, SiteHistoryService.sites());
		if (error) {
			console.error(error);
			this._errored = true;
			return;
		}
		this._sites = data ?? [];
		this._selectedSiteIds = new Set(this._sites.map(site => site.rootId));
	}

	private async _fetchTrends() {
		if (!this._sites.length) {
			return;
		}

		this._loading = true;
		const trendBySite = new Map<string, SiteTrendPoint[]>();

		await Promise.all(this._sites.map(async (site) => {
			const { data, error } = await tryExecute(this, SiteHistoryService.trend({
				path: { rootContentId: site.rootId },
				query: this._selectedCulture ? { culture: this._selectedCulture } : undefined
			}));
			if (error) {
				console.error(error);
				return;
			}
			trendBySite.set(site.rootId, data ?? []);
		}));

		this._trendBySite = trendBySite;
		this._loading = false;
	}

	private _handleCultureChange(e: Event) {
		const select = e.target as HTMLSelectElement;
		this._selectedCulture = select.value;
		this._fetchTrends();
	}

	private _toggleSite(rootId: string) {
		const selected = new Set(this._selectedSiteIds);
		if (selected.has(rootId)) {
			selected.delete(rootId);
		} else {
			selected.add(rootId);
		}
		this._selectedSiteIds = selected;
	}

	private _selectAll() {
		this._selectedSiteIds = new Set(this._sites.map(site => site.rootId));
	}

	private _selectNone() {
		this._selectedSiteIds = new Set();
	}

	private get _selectedSites(): SiteSummary[] {
		return this._sites.filter(site => this._selectedSiteIds.has(site.rootId));
	}

	private _chartData() {
		const selected = this._selectedSites;
		const allDates = new Set<string>();
		selected.forEach(site => {
			(this._trendBySite.get(site.rootId) ?? []).forEach(point => allDates.add(point.date));
		});
		const dates = Array.from(allDates).sort();

		return {
			labels: dates.map(date => format(new Date(date), "d MMM ''yy")),
			datasets: selected.map((site, index) => {
				const pointsByDate = new Map((this._trendBySite.get(site.rootId) ?? []).map(point => [point.date, point.averageScore]));
				const color = CHART_COLORS[index % CHART_COLORS.length];
				return {
					label: site.rootName,
					data: dates.map(date => pointsByDate.has(date) ? pointsByDate.get(date) : null),
					borderColor: color,
					backgroundColor: color,
					spanGaps: true,
					tension: 0.3,
					fill: false
				};
			})
		};
	}

	private _getTrend(current: number, previous: number | undefined): Trend {
		if (previous === undefined) return null;
		if (current === previous) return 'same';
		return current > previous ? 'improved' : 'worsened';
	}

	private _renderTrend(trend: Trend) {
		if (trend === null) return null;
		if (trend === 'improved') return html`<span class="c-trend c-trend--improved" aria-label="Improved">&uarr;</span>`;
		if (trend === 'worsened') return html`<span class="c-trend c-trend--worsened" aria-label="Worsened">&darr;</span>`;
		return html`<span class="c-trend c-trend--same" aria-label="No change">&rarr;</span>`;
	}

	private _siteRows() {
		return this._selectedSites.map(site => {
			const points = this._trendBySite.get(site.rootId) ?? [];
			const latest = points[points.length - 1] as SiteTrendPoint | undefined;
			const previous = points[points.length - 2] as SiteTrendPoint | undefined;
			return {
				site,
				latest,
				trend: latest ? this._getTrend(latest.averageScore, previous?.averageScore) : null
			};
		});
	}

	private exportTrends() {
		const rows: Array<{ site: string; date: string; averageScore: number; pagesTested: number; totalViolations: number }> = [];

		this._selectedSites.forEach(site => {
			(this._trendBySite.get(site.rootId) ?? []).forEach(point => {
				rows.push({
					site: site.rootName,
					date: format(new Date(point.date), "yyyy-MM-dd"),
					averageScore: point.averageScore,
					pagesTested: point.pagesTested,
					totalViolations: point.totalViolations
				});
			});
		});

		if (!rows.length) {
			return;
		}

		try {
			const worksheet = utils.json_to_sheet(rows);
			utils.sheet_add_aoa(worksheet, [["Site", "Date", "Average Score", "Pages Tested", "Total Violations"]], { origin: "A1" });
			worksheet["!cols"] = [{ width: 25 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 15 }];

			const workbook = utils.book_new();
			utils.book_append_sheet(workbook, worksheet, "Site History");

			AccessibilityReporterService.downloadWorkbook(workbook,
				AccessibilityReporterService.formatFileName(`accessibility-site-history-${format(new Date(), "yyyy-MM-dd")}`) + ".xlsx");
		} catch (error) {
			console.error(error);
			this._notificationContext?.peek('danger', { data: { message: 'An error occurred exporting site history. Please try again later.' } });
		}
	}

	render() {
		return html`
		<uui-scroll-container>
			<div class="c-dashboard-grid">
				<uui-box class="c-dashboard-grid__full-row">
					<div slot="headline">
						<h1 class="c-title">Accessibility History</h1>
					</div>

					${this._errored ? html`<p>Something went wrong loading site history.</p>` : null}
					${!this._errored && this._sites.length === 0 ? html`<p>No test run history has been recorded yet - run some accessibility tests first.</p>` : null}

					${this._sites.length > 0 ? html`
						<div class="c-site-controls">
							<uui-button look="secondary" compact label="Select all sites" @click="${this._selectAll}">Select all</uui-button>
							<uui-button look="secondary" compact label="Select no sites" @click="${this._selectNone}">Select none</uui-button>
							${this._availableLanguages.length > 1 ? html`
								<div class="c-language-picker">
									<label for="ar-history-culture-select" class="c-language-picker__label">Language:</label>
									<select id="ar-history-culture-select" class="c-language-picker__select" .value="${this._selectedCulture}" @change="${this._handleCultureChange}">
										<option value="">All languages</option>
										${this._availableLanguages.map(lang => html`<option value=${lang.unique} ?selected=${lang.unique === this._selectedCulture}>${lang.name}</option>`)}
									</select>
								</div>
							` : null}
						</div>

						<span class="c-site-checklist__heading">Sites shown below:</span>
						<div class="c-site-checklist">
							${this._sites.map(site => html`
								<uui-toggle
									label=${site.rootName}
									?checked=${this._selectedSiteIds.has(site.rootId)}
									@change=${() => this._toggleSite(site.rootId)}>
									<span class="c-site-checklist__label">${site.rootName}</span>
								</uui-toggle>
							`)}
						</div>

						<uui-button look="primary" color="default" @click="${this.exportTrends.bind(this)}" label="Export site history as an xlsx file" class="c-summary__button">Export history</uui-button>
					` : null}
				</uui-box>

				${this._loading ? html`
					<uui-box class="c-dashboard-grid__full-row">
						<uui-loader-bar animationDuration="1.5" style="color: #443b52"></uui-loader-bar>
					</uui-box>
				` : null}

				${!this._loading && this._selectedSites.length > 0 ? html`
					<uui-box class="c-dashboard-grid__full-row">
						<div slot="headline">
							<h2 class="c-title">Score Trend</h2>
						</div>
						<ar-chart type="line" .data="${this._chartData()}" width="900" height="350"></ar-chart>
					</uui-box>

					<uui-box class="c-dashboard-grid__full-row">
						<div slot="headline">
							<h2 class="c-title">Site Comparison</h2>
						</div>
						<div class="c-table__container">
							<uui-table>
								<uui-table-head>
									<uui-table-head-cell>Site</uui-table-head-cell>
									<uui-table-head-cell>Latest Score</uui-table-head-cell>
									<uui-table-head-cell>Pages Tested</uui-table-head-cell>
									<uui-table-head-cell>Last Run Date</uui-table-head-cell>
								</uui-table-head>
								${this._siteRows().map(row => html`
								<uui-table-row>
									<uui-table-cell>${row.site.rootName}</uui-table-cell>
									<uui-table-cell>${row.latest?.averageScore ?? '-'} ${this._renderTrend(row.trend)}</uui-table-cell>
									<uui-table-cell>${row.latest?.pagesTested ?? '-'}</uui-table-cell>
									<uui-table-cell>${row.latest ? format(new Date(row.latest.date), "MMMM do yyyy") : '-'}</uui-table-cell>
								</uui-table-row>
								`)}
							</uui-table>
						</div>
					</uui-box>
				` : null}
			</div>
		</uui-scroll-container>
		`;
	}

	static styles = [
		generalStyles,
		css`
			:host {
				display: block;
				padding: 24px;
			}
			.c-site-controls {
				display: flex;
				align-items: center;
				gap: 10px;
				margin-bottom: 10px;
				flex-wrap: wrap;
			}
			.c-site-checklist__heading {
				display: block;
				font-size: 14px;
				font-weight: 500;
				margin-bottom: 6px;
			}
			.c-site-checklist {
				display: flex;
				flex-wrap: wrap;
				align-items: center;
				gap: 16px;
				margin-bottom: 16px;
			}
			.c-site-checklist__label {
				font-weight: 500;
			}
			.c-language-picker {
				display: flex;
				align-items: center;
				gap: 10px;
			}
			.c-language-picker__label {
				font-size: 14px;
				font-weight: 500;
				white-space: nowrap;
			}
			.c-language-picker__select {
				padding: 6px 10px;
				border: 1px solid var(--uui-color-border, #d8d7d9);
				border-radius: var(--uui-border-radius, 3px);
				background: var(--uui-color-surface, #fff);
				font-size: 14px;
				color: var(--uui-color-text, #1b1b1f);
				cursor: pointer;
			}
			.c-language-picker__select:focus {
				outline: 2px solid var(--uui-color-focus, #3544b1);
				outline-offset: 2px;
			}
			.c-trend {
				font-size: 0.875rem;
				font-weight: bold;
			}
			.c-trend--improved { color: #3d8f3d; }
			.c-trend--worsened { color: #c0392b; }
			.c-trend--same { color: #888; }
		`
	];
}

export default ARSiteHistoryDashboardElement;

declare global {
	interface HTMLElementTagNameMap {
		"ar-site-history-dashboard": ARSiteHistoryDashboardElement;
	}
}
