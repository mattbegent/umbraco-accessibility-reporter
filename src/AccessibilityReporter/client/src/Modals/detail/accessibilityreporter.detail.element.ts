import { customElement, html, ifDefined } from "@umbraco-cms/backoffice/external/lit";
import { UmbModalBaseElement, UmbModalRejectReason } from "@umbraco-cms/backoffice/modal";
import { css } from "lit";
import { DetailModalData, DetailModalValue } from "./accessibilityreporter.detail.modal.token.ts";
import AccessibilityReporterService from "../../Services/accessibility-reporter.service.ts";
import { getWcagLinks } from "../../Utils/wcag-links.ts";
import { generalStyles } from "../../Styles/general.ts";

@customElement('accessibility-report-detail-modal')
export class DetailModalElement extends UmbModalBaseElement<DetailModalData, DetailModalValue>
{
    constructor() {
        super();
    }

    connectedCallback() {
        super.connectedCallback();
    }

    private handleClose() {
        this.modalContext?.reject({ type: "close" } as UmbModalRejectReason);
    }

	private addFullStop(sentence: string) {
		return sentence.replace(/([^.])$/, '$1.');
	};

	private formatFailureSummary(summary: string) {
		return this.addFullStop(summary.replace('Fix any of the following:', '').replace('Fix all of the following:', ''));
	};

    render() {

        return html`
            <umb-body-layout headline="${ifDefined(this.data?.result.help)}">

				${this.data?.result.nodes.map((issue, index) => html`
				<uui-box>

                    <div slot="headline">
                        <h2 class="c-title">Violation ${index + 1} <uui-tag slot="headline" color="${AccessibilityReporterService.impactToTag(this.data?.result.impact || "")}" look="primary" style="margin-left: 10px;">${AccessibilityReporterService.upperCaseFirstLetter(this.data?.result.impact || "")}</uui-tag></h2>
                    </div>

                    <h3 class="c-detail__title" style="margin-top: 0;">Description</h3>
                    <p>${this.addFullStop(this.data?.result.description || "")}</p>

					${this.data?.result.tags && getWcagLinks(this.data.result.tags).length ? html`
						<div class="c-wcag-links">
							${getWcagLinks(this.data.result.tags).map(link => html`
								<a href="${link.url}" target="_blank" rel="noopener noreferrer" class="c-wcag-link">
									WCAG ${link.criterion} <span class="sr-only">(opens in a new tab)</span>
								</a>
							`)}
						</div>
					` : null}

                    <h3 class="c-detail__title">Location</h3>
                    <pre class="code">${issue.target[0]}</pre>

                    <h3 class="c-detail__title">HTML Source</h3>
                    <pre class="code">${issue.html}</pre>

                    <h3 class="c-detail__title">Failure Summary</h3>
                    <p>${this.formatFailureSummary(issue.failureSummary)}</p>

					${issue.any.length && issue.any[0].relatedNodes.length ? html`
						<div>
							<h3 style="font-size: 16px; font-weight: 700;">Related Nodes</h3>
							<pre class="code">${issue.any[0].relatedNodes[0].html}</pre>
						</div>
					` : null}


                </uui-box>
				`)}

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
		}
		.c-wcag-links {
			display: flex;
			gap: 0.5rem;
			flex-wrap: wrap;
			margin-top: 0.5rem;
		}
		.c-wcag-link {
			display: inline-flex;
			align-items: center;
			padding: 0.25rem 0.75rem;
			background-color: var(--uui-color-surface-alt, #f3f3f5);
			border: 1px solid var(--uui-color-border, #d8d7d9);
			border-radius: 3px;
			color: var(--uui-color-interactive, #1b264f);
			text-decoration: none;
			font-size: 13px;
			font-weight: 600;
		}
		.c-wcag-link:hover {
			background-color: var(--uui-color-interactive, #1b264f);
			color: var(--uui-color-surface, #fff);
		}
    `];
}

export default DetailModalElement;
