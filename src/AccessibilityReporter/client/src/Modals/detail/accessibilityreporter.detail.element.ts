import { customElement, html, ifDefined } from "@umbraco-cms/backoffice/external/lit";
import { UmbModalBaseElement, UmbModalRejectReason } from "@umbraco-cms/backoffice/modal";
import { css } from "lit";
import { DetailModalData, DetailModalValue } from "./accessibilityreporter.detail.modal.token.ts";
import AccessibilityReporterService from "../../Services/accessibility-reporter.service.ts";

@customElement('accessibility-report-detail-modal')
export class DetailModalElement extends UmbModalBaseElement<DetailModalData, DetailModalValue>
{
    constructor() {
        super();
        // If any contexts needed consume them in ctor
    }

    connectedCallback() {
        super.connectedCallback();
    }

    private submitSomething() {
    //     this.modalContext?.setValue({
    //         thing: 'What up Bege'
    //     });
    //     this.modalContext?.submit();
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

                <!-- <uui-box headline="Data">
                    <pre>${JSON.stringify(this.data, null, 2)}</pre>
                </uui-box> -->

				${this.data?.result.nodes.map((issue, index) => html`
				<uui-box>

                    <div slot="headline">
                        <h2 class="c-title">Violation ${index + 1} <uui-tag slot="headline" color="${AccessibilityReporterService.impactToTag(this.data?.result.impact || "")}" look="primary" style="margin-left: 10px;">${AccessibilityReporterService.upperCaseFirstLetter(this.data?.result.impact || "")}</uui-tag></h2>
                    </div>

                    <h3 class="c-detail__title" style="margin-top: 0;">Description</h3>
                    <p>${this.addFullStop(this.data?.result.description || "")}</p>

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
                    <!-- <uui-button label="Submit" look="primary" @click="${this.submitSomething}">Submit</uui-button> -->
                    <uui-button label="Close" @click="${this.handleClose}">Close</uui-button>
                </div>
            </umb-body-layout>
        `;
    }

    static styles = css`
        uui-box {
            margin-bottom: 1rem;
        }
		.code {
			padding: 1rem;
			background-color: #f4f4f4;
		}
    `;
}

export default DetailModalElement;
