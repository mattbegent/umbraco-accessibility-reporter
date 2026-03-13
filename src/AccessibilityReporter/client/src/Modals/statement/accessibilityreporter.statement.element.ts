import { customElement, html, state, unsafeHTML } from "@umbraco-cms/backoffice/external/lit";
import { UmbModalBaseElement, UmbModalRejectReason } from "@umbraco-cms/backoffice/modal";
import { css } from "lit";
import { marked } from 'marked';
import { tryExecuteAndNotify } from "@umbraco-cms/backoffice/resources";
import { AiSummaryService } from "../../api";
import { StatementModalData, StatementModalValue } from "./accessibilityreporter.statement.modal.token.js";

type StatementState = 'idle' | 'loading' | 'done' | 'unavailable' | 'error';

@customElement('accessibility-reporter-statement-modal')
export class StatementModalElement extends UmbModalBaseElement<StatementModalData, StatementModalValue> {

    @state()
    private _state: StatementState = 'idle';

    @state()
    private _statement: string = '';

    @state()
    private _websiteName: string = '';

    @state()
    private _websiteUrl: string = '';

    @state()
    private _organisationName: string = '';

    private get _formValid(): boolean {
        return !!this._websiteName && !!this._websiteUrl && !!this._organisationName;
    }

    private _handleClose() {
        this.modalContext?.reject({ type: 'close' } as UmbModalRejectReason);
    }

    private _copyToClipboard() {
        navigator.clipboard.writeText(this._statement);
    }

    private async _generate() {
        this._state = 'loading';

        try {
            const violationMap = new Map<string, { impact: string; help: string; totalOccurrences: number; affectedPages: Set<string> }>();

            for (const page of this.data!.results.pages) {
                for (const violation of page.violations) {
                    const existing = violationMap.get(violation.id);
                    if (existing) {
                        existing.totalOccurrences += violation.nodes.length;
                        existing.affectedPages.add(page.page.url);
                    } else {
                        violationMap.set(violation.id, {
                            impact: violation.impact,
                            help: violation.title || violation.id,
                            totalOccurrences: violation.nodes.length,
                            affectedPages: new Set([page.page.url])
                        });
                    }
                }
            }

            const mostCommonViolations = Array.from(violationMap.entries())
                .map(([id, data]) => ({
                    id,
                    impact: data.impact,
                    help: data.help,
                    totalOccurrences: data.totalOccurrences,
                    affectedPages: data.affectedPages.size
                }))
                .sort((a, b) => b.totalOccurrences - a.totalOccurrences)
                .slice(0, 15);

            const request = {
                websiteName: this._websiteName,
                websiteUrl: this._websiteUrl,
                organisationName: this._organisationName,
                averageScore: this.data!.averagePageScore,
                totalPages: this.data!.numberOfPagesTested,
                totalViolations: this.data!.totalViolations,
                pages: this.data!.pagesTestResults.map((p) => ({
                    name: p.name,
                    url: p.url,
                    score: p.score,
                    violationCount: p.violations
                })),
                mostCommonViolations
            };

            const { data, error } = await tryExecuteAndNotify(this, AiSummaryService.accessibilityStatement({ body: request }));

            if (error || !data) {
                this._state = 'error';
                return;
            }

            if (!data.available) {
                this._state = 'unavailable';
                return;
            }

            if (!data.summary) {
                this._state = 'error';
                return;
            }

            this._statement = data.summary;
            this._state = 'done';
        } catch {
            this._state = 'error';
        }
    }

    render() {
        return html`
            <umb-body-layout headline="AI Accessibility Statement">

                ${this._state === 'idle' ? html`
                    <div class="c-intro">
                        <p>Generate an accessibility statement based on the <a href="https://www.gov.uk/government/publications/sample-accessibility-statement/sample-accessibility-statement-for-a-fictional-public-sector-website" target="_blank" rel="noopener noreferrer">GOV.UK template</a>, populated with data from your accessibility audit results.</p>
                    </div>
                    <div class="c-form">
                        <uui-form-layout-item>
                            <uui-label for="websiteName" slot="label" required>Website Name</uui-label>
                            <uui-input id="websiteName" label="Website Name" placeholder="e.g. My Organisation Website" .value=${this._websiteName} @input=${(e: InputEvent) => this._websiteName = (e.target as HTMLInputElement).value}></uui-input>
                        </uui-form-layout-item>
                        <uui-form-layout-item>
                            <uui-label for="websiteUrl" slot="label" required>Website URL</uui-label>
                            <uui-input id="websiteUrl" label="Website URL" placeholder="e.g. https://www.example.com" .value=${this._websiteUrl} @input=${(e: InputEvent) => this._websiteUrl = (e.target as HTMLInputElement).value}></uui-input>
                        </uui-form-layout-item>
                        <uui-form-layout-item>
                            <uui-label for="organisationName" slot="label" required>Organisation Name</uui-label>
                            <uui-input id="organisationName" label="Organisation Name" placeholder="e.g. My Organisation" .value=${this._organisationName} @input=${(e: InputEvent) => this._organisationName = (e.target as HTMLInputElement).value}></uui-input>
                        </uui-form-layout-item>
                    </div>
                ` : null}

                ${this._state === 'loading' ? html`
                    <div class="c-loading">
                        <uui-loader-bar animationDuration="1.5" style="color: #443b52"></uui-loader-bar>
                        <p>Generating accessibility statement&hellip; This may take a moment.</p>
                    </div>
                ` : null}

                ${this._state === 'done' ? html`
                    <div class="c-statement">
                        ${unsafeHTML(marked.parse(this._statement) as string)}
                    </div>
                ` : null}

                ${this._state === 'unavailable' ? html`
                    <uui-box>
                        <p>AI accessibility statements are not available. To use this feature, install
                            <a href="https://www.nuget.org/packages/Umbraco.Community.AccessibilityReporter.AI" target="_blank" rel="noopener noreferrer">Umbraco.Community.AccessibilityReporter.AI</a>
                            alongside <a href="https://github.com/umbraco/Umbraco.AI" target="_blank" rel="noopener noreferrer">Umbraco.AI</a> and a provider package.
                        </p>
                    </uui-box>
                ` : null}

                ${this._state === 'error' ? html`
                    <uui-box>
                        <p>An error occurred generating the accessibility statement. Please ensure Umbraco.AI is configured with a default chat profile.</p>
                        <uui-button look="secondary" color="default" @click="${() => { this._state = 'idle'; }}" label="Try again">Try Again</uui-button>
                    </uui-box>
                ` : null}

                <div slot="actions">
                    ${this._state === 'idle' ? html`
                        <uui-button label="Close" look="secondary" @click="${this._handleClose}">Close</uui-button>
                        <uui-button label="Generate" look="primary" color="positive" ?disabled=${!this._formValid} @click="${this._generate}">Generate Statement</uui-button>
                    ` : this._state === 'done' ? html`
                        <uui-button label="Back" look="secondary" @click="${() => { this._state = 'idle'; }}">Generate New Statement</uui-button>
                        <uui-button label="Copy as Markdown" look="primary" color="default" @click="${this._copyToClipboard}">Copy as Markdown</uui-button>
                        <uui-button label="Close" look="secondary" @click="${this._handleClose}">Close</uui-button>
                    ` : html`
                        <uui-button label="Close" @click="${this._handleClose}">Close</uui-button>
                    `}
                </div>

            </umb-body-layout>
        `;
    }

    static styles = css`
        :host {
            display: block;
        }

        .c-intro {
            margin-bottom: 16px;
        }

        .c-loading {
            text-align: center;
            padding: 24px 0;
        }

        .c-form uui-form-layout-item {
            margin-bottom: 8px;
        }

        .c-form uui-input {
            width: 100%;
        }

        .c-statement {
            background: var(--uui-color-surface-alt, #f4f4f4);
            border-radius: var(--uui-border-radius, 4px);
            padding: 16px;
            line-height: 1.6;
            max-height: 70vh;
            overflow-y: auto;
        }

        .c-statement p:first-child {
            margin-top: 0;
        }

        .c-statement p:last-child {
            margin-bottom: 0;
        }

        .c-statement ul,
        .c-statement ol {
            padding-left: 1.5em;
            margin: 0.5em 0;
        }

        .c-statement li {
            margin-bottom: 0.25em;
        }

        .c-statement strong {
            font-weight: 600;
        }

        .c-statement h2 {
            font-size: 1.3em;
            margin-top: 1.5em;
        }

        .c-statement h3 {
            font-size: 1.1em;
            margin-top: 1.2em;
        }
    `;
}

export default StatementModalElement;
