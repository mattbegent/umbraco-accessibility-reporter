import { LitElement, css, html, customElement, property, state, unsafeHTML } from "@umbraco-cms/backoffice/external/lit";
import { marked } from 'marked';
import AiSummaryState from "../Enums/ai-summary-state";
import { generalStyles } from "../Styles/general";

@customElement('ar-ai-accessibility-statement')
export class ARAiAccessibilityStatementElement extends LitElement {

	@property({ attribute: false })
	state: AiSummaryState = AiSummaryState.Idle;

	@property()
	statement: string = '';

	@property({ attribute: false })
	onGenerate: (websiteName: string, websiteUrl: string, organisationName: string) => void = () => {};

	@state()
	private websiteName: string = '';

	@state()
	private websiteUrl: string = '';

	@state()
	private organisationName: string = '';

	private handleGenerate() {
		this.onGenerate(this.websiteName, this.websiteUrl, this.organisationName);
	}

	private copyToClipboard() {
		navigator.clipboard.writeText(this.statement);
	}

	render() {
		return html`
			<uui-box>
				<div slot="headline" class="c-title__group">
					<svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" style="enable-background:new 0 0 24 24" viewBox="0 0 24 24" width="42" height="42">
						<circle cx="12" cy="12" r="10" style="fill:#ffffff;stroke:#443b52;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round"/>
						<path d="M8 7h8M8 10h8M8 13h5" style="fill:none;stroke:#443b52;stroke-width:1.5;stroke-linecap:round"/>
						<path d="M15 15l2 2m0-2l-2 2" style="fill:none;stroke:#443b52;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round"/>
					</svg>
					<h2 class="c-title">AI Accessibility Statement</h2>
				</div>
				${this.state === AiSummaryState.Idle ? html`
					<p>Generate an accessibility statement based on the <a href="https://www.gov.uk/government/publications/sample-accessibility-statement/sample-accessibility-statement-for-a-fictional-public-sector-website" target="_blank" rel="noopener noreferrer">GOV.UK template</a>, populated with data from your accessibility audit results.</p>
					<div class="c-form">
						<uui-form-layout-item>
							<uui-label for="websiteName" slot="label" required>Website Name</uui-label>
							<uui-input id="websiteName" label="Website Name" placeholder="e.g. My Organisation Website" .value=${this.websiteName} @input=${(e: InputEvent) => this.websiteName = (e.target as HTMLInputElement).value}></uui-input>
						</uui-form-layout-item>
						<uui-form-layout-item>
							<uui-label for="websiteUrl" slot="label" required>Website URL</uui-label>
							<uui-input id="websiteUrl" label="Website URL" placeholder="e.g. https://www.example.com" .value=${this.websiteUrl} @input=${(e: InputEvent) => this.websiteUrl = (e.target as HTMLInputElement).value}></uui-input>
						</uui-form-layout-item>
						<uui-form-layout-item>
							<uui-label for="organisationName" slot="label" required>Organisation Name</uui-label>
							<uui-input id="organisationName" label="Organisation Name" placeholder="e.g. My Organisation" .value=${this.organisationName} @input=${(e: InputEvent) => this.organisationName = (e.target as HTMLInputElement).value}></uui-input>
						</uui-form-layout-item>
					</div>
					<uui-button look="primary" color="default" @click="${this.handleGenerate}" label="Generate AI accessibility statement" ?disabled=${!this.websiteName || !this.websiteUrl || !this.organisationName}>Generate Accessibility Statement</uui-button>
				` : null}
				${this.state === AiSummaryState.Loading ? html`
					<uui-loader-bar animationDuration="1.5" style="color: #443b52"></uui-loader-bar>
					<p>Generating accessibility statement&hellip; This may take a moment.</p>
				` : null}
				${this.state === AiSummaryState.Done ? html`
					<div class="c-ai-statement">
						${unsafeHTML(marked.parse(this.statement) as string)}
					</div>
					<div class="c-button-group">
						<uui-button look="primary" color="default" @click="${this.copyToClipboard}" label="Copy accessibility statement as markdown">Copy as Markdown</uui-button>
						<uui-button look="secondary" color="default" @click="${() => { this.state = AiSummaryState.Idle; }}" label="Generate a new accessibility statement">Generate New Statement</uui-button>
					</div>
				` : null}
				${this.state === AiSummaryState.Unavailable ? html`
					<p>AI accessibility statements are not available. To use this feature, install <a href="https://www.nuget.org/packages/Umbraco.Community.AccessibilityReporter.AI" target="_blank" rel="noopener noreferrer">Umbraco.Community.AccessibilityReporter.AI</a> alongside <a href="https://github.com/umbraco/Umbraco.AI" target="_blank" rel="noopener noreferrer">Umbraco.AI</a> and a provider package.</p>
				` : null}
				${this.state === AiSummaryState.Errored ? html`
					<p>An error occurred generating the accessibility statement. Please ensure Umbraco.AI is configured with a default chat profile.</p>
					<uui-button look="secondary" color="default" @click="${() => { this.state = AiSummaryState.Idle; }}" label="Try generating the accessibility statement again">Try again</uui-button>
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

			.c-form {
				margin-bottom: 16px;
			}

			.c-form uui-form-layout-item {
				margin-bottom: 8px;
			}

			.c-form uui-input {
				width: 100%;
			}

			.c-ai-statement {
				background: var(--uui-color-surface-alt, #f4f4f4);
				border-radius: var(--uui-border-radius, 4px);
				padding: 16px;
				margin-bottom: 12px;
				line-height: 1.6;
				max-height: 600px;
				overflow-y: auto;
			}

			.c-ai-statement p:first-child {
				margin-top: 0;
			}

			.c-ai-statement p:last-child {
				margin-bottom: 0;
			}

			.c-ai-statement ul,
			.c-ai-statement ol {
				padding-left: 1.5em;
				margin: 0.5em 0;
			}

			.c-ai-statement li {
				margin-bottom: 0.25em;
			}

			.c-ai-statement strong {
				font-weight: 600;
			}

			.c-ai-statement h2 {
				font-size: 1.3em;
				margin-top: 1.5em;
			}

			.c-ai-statement h3 {
				font-size: 1.1em;
				margin-top: 1.2em;
			}

			.c-button-group {
				display: flex;
				gap: 8px;
			}
    	`,
	];
}

declare global {
	interface HTMLElementTagNameMap {
		'ar-ai-accessibility-statement': ARAiAccessibilityStatementElement;
	}
}
