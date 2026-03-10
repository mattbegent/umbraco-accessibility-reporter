import { LitElement, css, html, customElement, property, unsafeHTML } from "@umbraco-cms/backoffice/external/lit";
import { marked } from 'marked';
import AiSummaryState from "../Enums/ai-summary-state";
import { generalStyles } from "../Styles/general";

@customElement('ar-ai-summary')
export class ARAiSummaryElement extends LitElement {

	@property({ attribute: false })
	state: AiSummaryState = AiSummaryState.Idle;

	@property()
	summary: string = '';

	@property({ attribute: false })
	onGenerate: () => void = () => {};

	@property()
	idleDescription: string = 'Generate an AI-powered summary of the accessibility issues.';

	render() {
		return html`
			<uui-box>
				<div slot="headline" class="c-title__group">
					<svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" style="enable-background:new 0 0 24 24" viewBox="0 0 24 24" width="42" height="42">
						<circle cx="12" cy="12" r="10" style="fill:#ffffff;stroke:#443b52;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round"/>
						<path d="M12 7v1M12 16v1M7 12h1M16 12h1M8.5 8.5l.7.7M14.8 14.8l.7.7M8.5 15.5l.7-.7M14.8 9.2l.7-.7" style="fill:none;stroke:#443b52;stroke-width:1.5;stroke-linecap:round"/>
						<circle cx="12" cy="12" r="2" style="fill:#443b52"/>
					</svg>
					<h2 class="c-title">AI Summary</h2>
				</div>
				${this.state === AiSummaryState.Idle ? html`
					<p>${this.idleDescription}</p>
					<uui-button look="primary" color="default" @click="${this.onGenerate}" label="Generate AI summary of accessibility issues">Generate AI Summary</uui-button>
				` : null}
				${this.state === AiSummaryState.Loading ? html`
					<uui-loader-bar animationDuration="1.5" style="color: #443b52"></uui-loader-bar>
					<p>Generating summary&hellip;</p>
				` : null}
				${this.state === AiSummaryState.Done ? html`
					<div class="c-ai-summary">
						${unsafeHTML(marked.parse(this.summary) as string)}
					</div>
					<uui-button look="secondary" color="default" @click="${this.onGenerate}" label="Regenerate AI summary of accessibility issues">Regenerate Summary</uui-button>
				` : null}
				${this.state === AiSummaryState.Unavailable ? html`
					<p>AI summaries are not available. To use this feature, install <a href="https://www.nuget.org/packages/Umbraco.Community.AccessibilityReporter.AI" target="_blank" rel="noopener noreferrer">Umbraco.Community.AccessibilityReporter.AI</a> alongside <a href="https://github.com/umbraco/Umbraco.AI" target="_blank" rel="noopener noreferrer">Umbraco.AI</a> and a provider package.</p>
				` : null}
				${this.state === AiSummaryState.Errored ? html`
					<p>An error occurred generating the summary. Please ensure Umbraco.AI is configured with a default chat profile.</p>
					<uui-button look="secondary" color="default" @click="${this.onGenerate}" label="Retry generating AI summary">Try again</uui-button>
				` : null}
			</uui-box>
		`;
	}

	static styles = [
		generalStyles,
		css`
			:host {
				display: block;
			}

			.c-ai-summary {
				background: var(--uui-color-surface-alt, #f4f4f4);
				border-radius: var(--uui-border-radius, 4px);
				padding: 16px;
				margin-bottom: 12px;
				line-height: 1.6;
			}

			.c-ai-summary p:first-child {
				margin-top: 0;
			}

			.c-ai-summary p:last-child {
				margin-bottom: 0;
			}

			.c-ai-summary ul,
			.c-ai-summary ol {
				padding-left: 1.5em;
				margin: 0.5em 0;
			}

			.c-ai-summary li {
				margin-bottom: 0.25em;
			}

			.c-ai-summary strong {
				font-weight: 600;
			}
    	`,
	];
}

declare global {
	interface HTMLElementTagNameMap {
		'ar-ai-summary': ARAiSummaryElement;
	}
}
