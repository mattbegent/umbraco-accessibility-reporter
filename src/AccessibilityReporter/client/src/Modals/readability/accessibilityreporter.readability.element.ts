import { customElement, html, state, unsafeHTML } from "@umbraco-cms/backoffice/external/lit";
import { UmbModalBaseElement, UmbModalRejectReason } from "@umbraco-cms/backoffice/modal";
import { css } from "lit";
import { marked } from 'marked';
import { ReadabilityModalData, ReadabilityModalValue } from "./accessibilityreporter.readability.modal.token.js";

type AnalysisState = 'loading' | 'done' | 'unavailable' | 'error';

@customElement('accessibility-reporter-readability-modal')
export class ReadabilityModalElement extends UmbModalBaseElement<ReadabilityModalData, ReadabilityModalValue> {

    @state()
    private _state: AnalysisState = 'loading';

    @state()
    private _improvedHtml: string = '';

    @state()
    private _explanation: string = '';

    @state()
    private _errorMessage: string = '';

    @state()
    private _showPreview: boolean = true;

    connectedCallback() {
        super.connectedCallback();
        this._analyse();
    }

    private async _analyse() {
        this._state = 'loading';

        try {
            const response = await fetch(
                `${this.data!.apiBaseUrl}/umbraco/accessibilityreporter/api/v1/ai/readability`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.data!.authToken}`
                    },
                    body: JSON.stringify({ html: this.data!.html })
                }
            );

            if (!response.ok) {
                this._state = 'error';
                this._errorMessage = `Server responded with ${response.status}.`;
                return;
            }

            const result = await response.json();

            if (!result.available) {
                this._state = 'unavailable';
                return;
            }

            if (!result.improvedHtml) {
                this._state = 'error';
                this._errorMessage = 'The AI was unable to generate readability improvements. Please try again.';
                return;
            }

            this._improvedHtml = result.improvedHtml;
            this._explanation = result.explanation ?? '';
            this._state = 'done';

        } catch {
            this._state = 'error';
            this._errorMessage = 'Could not connect to the readability service. Please try again.';
        }
    }

    private _handleApprove() {
        this.modalContext?.setValue({ approvedHtml: this._improvedHtml });
        this.modalContext?.submit();
    }

    private _handleReject() {
        this.modalContext?.reject({ type: 'close' } as UmbModalRejectReason);
    }

    private _togglePreview() {
        this._showPreview = !this._showPreview;
    }

    render() {
        return html`
            <umb-body-layout headline="Readability Check (WCAG 3.1.5)">

                ${this._state === 'loading' ? html`
                    <div class="c-loading">
                        <uui-loader-bar animationDuration="1.5" style="color: #443b52"></uui-loader-bar>
                        <p>Analysing readability and generating improvements&hellip;</p>
                        <p class="c-hint">This checks your content against <strong>WCAG 2.1 SC 3.1.5 (Reading Level)</strong>, aiming for lower secondary education reading level.</p>
                    </div>
                ` : null}

                ${this._state === 'done' ? html`
                    <div class="c-result">

                        ${this._explanation ? html`
                            <uui-box headline="What was changed">
                                <div class="c-explanation">
                                    ${unsafeHTML(marked.parse(this._explanation) as string)}
                                </div>
                            </uui-box>
                        ` : null}

                        <div class="c-toggle-row">
                            <uui-button
                                compact
                                look="secondary"
                                label="${this._showPreview ? 'Show HTML' : 'Show Preview'}"
                                @click="${this._togglePreview}">
                                ${this._showPreview ? 'Show HTML' : 'Show Preview'}
                            </uui-button>
                        </div>

                        <div class="c-comparison">
                            <uui-box headline="Original content">
                                ${this._showPreview
                                    ? html`<div class="c-preview">${unsafeHTML(this.data!.html)}</div>`
                                    : html`<pre class="c-code">${this.data!.html}</pre>`
                                }
                            </uui-box>
                            <uui-box headline="Improved content">
                                ${this._showPreview
                                    ? html`<div class="c-preview">${unsafeHTML(this._improvedHtml)}</div>`
                                    : html`<pre class="c-code">${this._improvedHtml}</pre>`
                                }
                            </uui-box>
                        </div>

                    </div>
                ` : null}

                ${this._state === 'unavailable' ? html`
                    <uui-box>
                        <p>AI readability checking is not available. To use this feature, install
                            <a href="https://www.nuget.org/packages/Umbraco.Community.AccessibilityReporter.AI" target="_blank" rel="noopener noreferrer">Umbraco.Community.AccessibilityReporter.AI</a>
                            alongside <a href="https://github.com/umbraco/Umbraco.AI" target="_blank" rel="noopener noreferrer">Umbraco.AI</a> and a provider package.
                        </p>
                    </uui-box>
                ` : null}

                ${this._state === 'error' ? html`
                    <uui-box>
                        <p>${this._errorMessage}</p>
                        <uui-button look="secondary" color="default" @click="${this._analyse}" label="Try again">Try Again</uui-button>
                    </uui-box>
                ` : null}

                <div slot="actions">
                    ${this._state === 'done' ? html`
                        <uui-button label="Reject" look="secondary" color="danger" @click="${this._handleReject}">Reject Changes</uui-button>
                        <uui-button label="Approve" look="primary" color="positive" @click="${this._handleApprove}">Approve Changes</uui-button>
                    ` : html`
                        <uui-button label="Close" @click="${this._handleReject}">Close</uui-button>
                    `}
                </div>

            </umb-body-layout>
        `;
    }

    static styles = css`
        :host {
            display: block;
        }

        .c-loading {
            text-align: center;
            padding: 24px 0;
        }

        .c-hint {
            color: var(--uui-color-text-alt, #888);
            font-size: 0.875rem;
            margin-top: 8px;
        }

        .c-result uui-box {
            margin-bottom: 16px;
        }

        .c-toggle-row {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 8px;
        }

        .c-comparison {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
        }

        .c-comparison uui-box {
            margin-bottom: 0;
            min-width: 0;
        }

        .c-explanation {
            line-height: 1.6;
        }

		.c-explanation h2 {
			margin-top: 0;
		}

        .c-explanation p:first-child {
            margin-top: 0;
        }

        .c-explanation p:last-child {
            margin-bottom: 0;
        }

        .c-preview {
            background: var(--uui-color-surface-alt, #f9f9f9);
            border: 1px solid var(--uui-color-border, #e0e0e0);
            border-radius: var(--uui-border-radius, 4px);
            padding: 16px;
            line-height: 1.6;
        }

        .c-code {
            background: var(--uui-color-surface-alt, #f4f4f4);
            border-radius: var(--uui-border-radius, 4px);
            padding: 16px;
            overflow-x: auto;
            white-space: pre-wrap;
            word-break: break-word;
            font-size: 0.875rem;
        }
    `;
}

export default ReadabilityModalElement;
