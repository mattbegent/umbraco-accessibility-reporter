import { customElement, html, state, css } from "@umbraco-cms/backoffice/external/lit";
import type { UUIPaginationElement } from "@umbraco-cms/backoffice/external/uui";
import { UmbModalBaseElement, UmbModalRejectReason } from "@umbraco-cms/backoffice/modal";
import { IssueModalData, IssueModalValue } from "./accessibilityreporter.issue.modal.token";
import AccessibilityReporterService from "../../Services/accessibility-reporter.service";
import { generateWorkspaceUrl } from "../../Services/workspace-url";
import { generalStyles } from "../../Styles/general";

const PAGES_PAGE_SIZE = 25;
const SHARED_ELEMENTS_SHOWN = 10;

@customElement('accessibility-report-issue-modal')
export class IssueModalElement extends UmbModalBaseElement<IssueModalData, IssueModalValue> {

	@state()
	private currentPage = 1;

	private handleClose() {
		this.modalContext?.reject({ type: "close" } as UmbModalRejectReason);
	}

	private async openPageInWorkspace(pageGuid: string) {
		const url = await generateWorkspaceUrl(this, pageGuid, this.data?.culture, this.data?.userLanguage);
		this.handleClose();
		window.location.href = url;
	}

	private pluralise(count: number, word: string) {
		return `${AccessibilityReporterService.formatNumber(count)} ${word}${count === 1 ? '' : 's'}`;
	}

	private renderSharedElements() {
		const issue = this.data!.issue;

		if (!issue.hasElementDetails) {
			return html`
				<uui-box>
					<div slot="headline"><h2 class="c-title">Shared components</h2></div>
					<p>Run the tests again to see whether this issue comes from an element shared across pages, such as a header, footer or reusable component.</p>
				</uui-box>
			`;
		}

		if (!issue.sharedElements.length) {
			return null;
		}

		return html`
			<uui-box>
				<div slot="headline"><h2 class="c-title">Likely shared components</h2></div>
				<p>These elements fail on more than one page, so they probably come from a shared template, partial or component. Fixing each one once should fix it on every page listed.</p>
				${issue.sharedElements.slice(0, SHARED_ELEMENTS_SHOWN).map(element => html`
					<div class="c-shared-element">
						<h3 class="c-shared-element__title">
							On ${this.pluralise(element.pageCount, 'page')}
							<span class="c-shared-element__instances">(${this.pluralise(element.instances, 'instance')})</span>
						</h3>
						<h4 class="c-shared-element__label">Location</h4>
						<pre class="code">${element.target}</pre>
						${element.html ? html`
							<h4 class="c-shared-element__label">HTML Source</h4>
							<pre class="code">${element.html}</pre>
						` : null}
					</div>
				`)}
				${issue.sharedElements.length > SHARED_ELEMENTS_SHOWN ? html`
					<p>And ${this.pluralise(issue.sharedElements.length - SHARED_ELEMENTS_SHOWN, 'more shared element')}.</p>
				` : null}
			</uui-box>
		`;
	}

	private renderPages() {
		const issue = this.data!.issue;
		const isMultisite = this.data!.isMultisite;
		const totalPages = Math.ceil(issue.pages.length / PAGES_PAGE_SIZE);
		const currentPage = Math.min(this.currentPage, Math.max(totalPages, 1));
		const firstIndex = (currentPage - 1) * PAGES_PAGE_SIZE;
		const pages = issue.pages.slice(firstIndex, firstIndex + PAGES_PAGE_SIZE);

		return html`
			<uui-box>
				<div slot="headline"><h2 class="c-title">Affected pages</h2></div>
				<div class="c-table__container">
					<uui-table aria-label="Pages with this issue">
						<uui-table-head>
							<uui-table-head-cell>Name</uui-table-head-cell>
							${isMultisite ? html`<uui-table-head-cell>Site</uui-table-head-cell>` : null}
							<uui-table-head-cell>URL</uui-table-head-cell>
							<uui-table-head-cell>Instances</uui-table-head-cell>
							<uui-table-head-cell>Score</uui-table-head-cell>
							<uui-table-head-cell>Action</uui-table-head-cell>
						</uui-table-head>
						${pages.map(page => html`
							<uui-table-row>
								<uui-table-cell>${page.name}</uui-table-cell>
								${isMultisite ? html`<uui-table-cell>${page.rootName}</uui-table-cell>` : null}
								<uui-table-cell><a href="${page.url}" target="_blank">${page.url} <span class="sr-only">Opens in a new window</span></a></uui-table-cell>
								<uui-table-cell>${page.instances}</uui-table-cell>
								<uui-table-cell>${page.score}</uui-table-cell>
								<uui-table-cell>
									<button type="button" @click="${() => this.openPageInWorkspace(page.guid)}" class="c-detail-button c-detail-button--active">
										<span class="c-detail-button__group">
											<uui-icon-registry-essential>
												<uui-icon name="see"></uui-icon>
											</uui-icon-registry-essential>
											<span class="c-detail-button__text">View Page <span class="sr-only">${page.name}</span></span>
										</span>
									</button>
								</uui-table-cell>
							</uui-table-row>
						`)}
					</uui-table>
				</div>
				${totalPages > 1 ? html`
					<p class="c-table-status" aria-live="polite">${AccessibilityReporterService.describeRange(firstIndex, pages.length, issue.pages.length, 'page')}</p>
					<div class="c-pagination">
						<uui-pagination
							label="Affected pages"
							.total=${totalPages}
							.current=${currentPage}
							@change=${(event: Event) => { this.currentPage = (event.target as UUIPaginationElement).current; }}>
						</uui-pagination>
					</div>
				` : null}
			</uui-box>
		`;
	}

	render() {
		if (!this.data) {
			return null;
		}

		const issue = this.data.issue;
		const standards = AccessibilityReporterService.mapTagsToStandard(issue.tags);

		return html`
			<umb-body-layout headline="${issue.title}">

				<uui-box>
					<div slot="headline">
						<h2 class="c-title">
							${AccessibilityReporterService.formatRuleId(issue.id)}
							<uui-tag color="${AccessibilityReporterService.impactToTag(issue.impact)}" look="primary" style="margin-left: 10px;">${AccessibilityReporterService.upperCaseFirstLetter(issue.impact || "")}</uui-tag>
						</h2>
					</div>
					<p class="c-issue-summary">
						<strong>${this.pluralise(issue.instances, 'instance')}</strong> across <strong>${this.pluralise(issue.pages.length, 'page')}</strong>.
					</p>
					${issue.description ? html`<p>${issue.description}</p>` : null}
					${standards.length ? html`
						<div class="c-standards">
							${standards.map(standard => html`<uui-tag look="secondary">${standard}</uui-tag>`)}
						</div>
					` : null}
					${issue.helpUrl ? html`
						<p><a href="${issue.helpUrl}" target="_blank" rel="noopener">How to fix this issue <span class="sr-only">Opens in a new window</span></a></p>
					` : null}
				</uui-box>

				${this.renderSharedElements()}

				${this.renderPages()}

				<div slot="actions">
					<uui-button label="Close" @click="${this.handleClose}">Close</uui-button>
				</div>
			</umb-body-layout>
		`;
	}

	static styles = [
		generalStyles,
		css`
			uui-box {
				margin-bottom: 1rem;
			}
			.code {
				padding: 1rem;
				background-color: #f4f4f4;
				white-space: pre-wrap;
				word-break: break-all;
				margin: 0 0 1rem 0;
			}
			.c-issue-summary {
				margin-top: 0;
			}
			.c-standards {
				display: flex;
				flex-wrap: wrap;
				gap: 6px;
				margin-bottom: 1rem;
			}
			.c-shared-element {
				border-top: 1px solid var(--uui-color-border, #d8d7d9);
				padding-top: 1rem;
			}
			.c-shared-element__title {
				font-size: 16px;
				font-weight: 700;
				margin: 0 0 0.5rem 0;
			}
			.c-shared-element__instances {
				font-weight: 400;
			}
			.c-shared-element__label {
				font-size: 14px;
				font-weight: 700;
				margin: 0 0 0.25rem 0;
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

export default IssueModalElement;

declare global {
	interface HTMLElementTagNameMap {
		'accessibility-report-issue-modal': IssueModalElement;
	}
}
