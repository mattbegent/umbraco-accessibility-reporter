import { LitElement, css, html, customElement, property, state } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import AiSummaryState from "../Enums/ai-summary-state";
import { generalStyles } from "../Styles/general";
import { tryExecute } from "@umbraco-cms/backoffice/resources";
import { AiSummaryService } from "../api";

interface ManualTest {
	test: string;
	category: string;
}

@customElement('ar-manual-tests')
export class ARManualTestsElement extends UmbElementMixin(LitElement) {

	@property()
	testURL: string = '';

	@property()
	pageName: string = '';

	@property({ attribute: false })
	results: any;

	@property({ type: Number })
	score: number = 0;

	@state()
	private aiState: AiSummaryState = AiSummaryState.Idle;

	@state()
	private aiTests: ManualTest[] = [];

	@state()
	private pageHtml: string = '';

	private get defaultTests(): ManualTest[] {
		const tests: ManualTest[] = [
			// Keyboard
			{ test: "All interactive elements can be reached and operated using keyboard controls.", category: "Keyboard" },
			{ test: "Tab order is consistent with how the page visually appears.", category: "Keyboard" },
			{ test: "There are no keyboard traps on elements that shouldn't be trapping focus.", category: "Keyboard" },
			{ test: "Interactive elements have a clear and visible focus style.", category: "Keyboard" },
			{ test: "Input focus does not change unexpectedly without user initiation.", category: "Keyboard" },
			{ test: "A skip link is present and visible when focused.", category: "Keyboard" },

			// Content
			{ test: "Plain language is used and figures of speech, idioms, and complicated metaphors are avoided.", category: "Content" },
			{ test: "Button, link, and label text is unique, descriptive and makes sense out of context.", category: "Content" },
			{ test: "Text is left-aligned for LTR languages (or right-aligned for RTL languages).", category: "Content" },

			// Visual / Appearance
			{ test: "Content is readable and functional when text size is increased to 200%.", category: "Visual" },
			{ test: "Colour is not the only way information is conveyed.", category: "Visual" },
			{ test: "Instructions do not rely solely on visual or audio cues (e.g. shape, size, position, sound).", category: "Visual" },
			{ test: "The layout is simple, straightforward, and consistent across pages.", category: "Visual" },
			{ test: "Content renders correctly in high contrast and other specialised browsing modes.", category: "Visual" },

			// Screen Reader
			{ test: "Heading elements are written in a logical sequence and no heading levels are skipped.", category: "Screen Reader" },
			{ test: "Images containing text have alt descriptions that include the image's text.", category: "Screen Reader" },
			{ test: "Complex images such as charts, graphs, and maps have a text alternative.", category: "Screen Reader" },
			{ test: "Decorative images use a null (empty) alt attribute value.", category: "Screen Reader" },

			// Forms
			{ test: "Form error, warning, and success states are not communicated by colour alone.", category: "Forms" },
			{ test: "Form input errors are displayed in a list above the form after submission.", category: "Forms" },

			// Media
			{ test: "Media does not autoplay.", category: "Media" },
			{ test: "All media can be paused by the user.", category: "Media" },
			{ test: "Videos have accurate captions.", category: "Media" },
			{ test: "Audio content has a transcript available.", category: "Media" },

			// Animation
			{ test: "Animations are subtle and do not flash more than three times per second.", category: "Animation" },
			{ test: "Animations respect the prefers-reduced-motion media query.", category: "Animation" },

			// Mobile
			{ test: "The site can be used in any orientation (portrait and landscape).", category: "Mobile" },
			{ test: "There is no unexpected horizontal scrolling.", category: "Mobile" },
		];

		if (this.results?.incomplete?.length) {
			tests.push({
				test: "Incomplete automated tests in the 'Incomplete Tests' section have been manually reviewed and passed.",
				category: "Automated"
			});
		}

		return tests;
	}

	private get groupedDefaultTests(): Map<string, ManualTest[]> {
		return this.groupTests(this.defaultTests);
	}

	private get groupedAiTests(): Map<string, ManualTest[]> {
		return this.groupTests(this.aiTests);
	}

	private groupTests(tests: ManualTest[]): Map<string, ManualTest[]> {
		const map = new Map<string, ManualTest[]>();
		for (const test of tests) {
			const existing = map.get(test.category);
			if (existing) {
				existing.push(test);
			} else {
				map.set(test.category, [test]);
			}
		}
		return map;
	}

	private async fetchPageHtml(): Promise<string> {
		if (this.pageHtml) return this.pageHtml;

		try {
			const response = await fetch(this.testURL);
			if (response.ok) {
				this.pageHtml = await response.text();
			}
		} catch {
			// Page may not be fetchable (CORS etc.) — continue without HTML
		}

		return this.pageHtml;
	}

	private async generateAiTests(): Promise<void> {
		this.aiState = AiSummaryState.Loading;

		try {
			const pageHtml = await this.fetchPageHtml();

			const request = {
				pageUrl: this.testURL,
				pageName: this.pageName,
				pageHtml: pageHtml,
				score: this.score,
				violations: this.results?.violations?.map((v: any) => ({
					id: v.id,
					impact: v.impact,
					help: v.help,
					nodeCount: v.nodes.length
				})) ?? [],
				incompleteCount: this.results?.incomplete?.length ?? 0
			};

			const { data, error } = await tryExecute(this, AiSummaryService.manualTests({ body: request }));

			console.log(error);
			console.log(data);

			if (error || !data) {
				this.aiState = AiSummaryState.Errored;
				return;
			}

			if (!data.available) {
				this.aiState = AiSummaryState.Unavailable;
				return;
			}

			if (!data.summary) {
				this.aiState = AiSummaryState.Errored;
				return;
			}

			let jsonText = data.summary.trim();
			const fenceMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
			if (fenceMatch) {
				jsonText = fenceMatch[1].trim();
			}
			const parsed = JSON.parse(jsonText) as ManualTest[];
			this.aiTests = parsed;
			this.aiState = AiSummaryState.Done;
		} catch (error) {
			console.error(error);
			this.aiState = AiSummaryState.Errored;
		}
	}

	private renderTestGroup(category: string, tests: ManualTest[]) {
		return html`
			<div class="c-test-group">
				<h3 class="c-test-group__title">${category}</h3>
				<div class="c-checklist">
					${tests.map(t => html`
						<div class="c-checklist__item">
							<uui-toggle label="${t.test}"></uui-toggle>
						</div>
					`)}
				</div>
			</div>
		`;
	}

	render() {
		return html`
			<uui-box>
				<div slot="headline" class="c-title__group">
					<div class="c-circle">
						<svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" width="18" height="18" viewBox="0 0 500 500"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="2.613" stroke-width="30"><path d="M201.404 415.551H450M201.404 250H450M201.404 84.45H450M129.745 118.506c0 3.213-2.603 5.798-5.815 5.798M123.93 124.305H55.815M55.815 124.305A5.799 5.799 0 0 1 50 118.507M50 118.506V50.445M50 50.445c0-3.231 2.603-5.851 5.815-5.851M55.815 44.595h68.115M123.93 44.595c3.213 0 5.815 2.62 5.815 5.851M129.745 50.445v68.061M129.745 284.074a5.79 5.79 0 0 1-5.815 5.799M123.93 289.873H55.815M55.815 289.873A5.787 5.787 0 0 1 50 284.074M50 284.074v-68.095M50 215.979c0-3.231 2.603-5.851 5.815-5.851M55.815 210.128h68.115M123.93 210.128c3.213 0 5.815 2.619 5.815 5.851M129.745 215.979v68.095M129.745 449.607c0 3.248-2.603 5.798-5.815 5.798M123.93 455.405H55.815M55.815 455.405c-3.213 0-5.815-2.55-5.815-5.798M50 449.607v-68.079M50 381.528c0-3.213 2.603-5.833 5.815-5.833M55.815 375.695h68.115M123.93 375.695c3.213 0 5.815 2.62 5.815 5.833M129.745 381.528v68.079" /></g></svg>
					</div>
					<h2 class="c-title">Manual Tests</h2>
				</div>
				<p class="c-paragraph">Automated accessibility tests can only catch up to <strong>37% of accessibility issues</strong>. Manual testing is needed to ensure that this page is fully accessible.</p>
				<p class="c-paragraph__spaced">As a minimum it is recommended that the following manual tests are run on <a href="${this.testURL}" target="_blank" class="btn-link -underline c-bold">${this.pageName}<span class="sr-only"> (opens in a new window)</span></a> every time that the automated tests are run. Tests sourced from the <a href="https://www.a11yproject.com/checklist/" target="_blank" rel="noopener noreferrer">A11Y Project Checklist<span class="sr-only"> (opens in a new window)</span></a>.</p>

				${Array.from(this.groupedDefaultTests.entries()).map(([category, tests]) =>
					this.renderTestGroup(category, tests)
				)}

				<div class="c-ai-section">
					<div class="c-ai-section__header">
						<svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" style="enable-background:new 0 0 24 24" viewBox="0 0 24 24" width="28" height="28">
							<circle cx="12" cy="12" r="10" style="fill:#ffffff;stroke:#443b52;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round"/>
							<path d="M12 7v1M12 16v1M7 12h1M16 12h1M8.5 8.5l.7.7M14.8 14.8l.7.7M8.5 15.5l.7-.7M14.8 9.2l.7-.7" style="fill:none;stroke:#443b52;stroke-width:1.5;stroke-linecap:round"/>
							<circle cx="12" cy="12" r="2" style="fill:#443b52"/>
						</svg>
						<h3 class="c-ai-section__title">AI-Tailored Tests</h3>
					</div>

					${this.aiState === AiSummaryState.Idle ? html`
						<p>Generate manual tests tailored to the specific content and elements on this page using AI.</p>
						<uui-button look="primary" color="default" @click="${this.generateAiTests}" label="Generate AI-tailored manual tests for this page">Generate AI Tests</uui-button>
					` : null}

					${this.aiState === AiSummaryState.Loading ? html`
						<uui-loader-bar animationDuration="1.5" style="color: #443b52"></uui-loader-bar>
						<p>Analysing page content and generating tailored tests&hellip;</p>
					` : null}

					${this.aiState === AiSummaryState.Done ? html`
						${Array.from(this.groupedAiTests.entries()).map(([category, tests]) =>
							this.renderTestGroup(category, tests)
						)}
						<uui-button look="secondary" color="default" @click="${this.generateAiTests}" label="Regenerate AI-tailored manual tests">Regenerate AI Tests</uui-button>
					` : null}

					${this.aiState === AiSummaryState.Unavailable ? html`
						<p>AI-tailored tests are not available. To use this feature, install <a href="https://www.nuget.org/packages/Umbraco.Community.AccessibilityReporter.AI" target="_blank" rel="noopener noreferrer">Umbraco.Community.AccessibilityReporter.AI</a> alongside <a href="https://github.com/umbraco/Umbraco.AI" target="_blank" rel="noopener noreferrer">Umbraco.AI</a> and a provider package.</p>
					` : null}

					${this.aiState === AiSummaryState.Errored ? html`
						<p>An error occurred generating AI-tailored tests. Please ensure Umbraco.AI is configured with a default chat profile.</p>
						<uui-button look="secondary" color="default" @click="${this.generateAiTests}" label="Retry generating AI-tailored manual tests">Try again</uui-button>
					` : null}
				</div>
			</uui-box>
		`;
	}

	static styles = [
		generalStyles,
		css`
			:host {
				display: block;
			}

			.c-test-group {
				margin-bottom: 16px;
			}

			.c-test-group__title {
				font-size: 0.95em;
				font-weight: 600;
				color: var(--uui-color-text, #1b264f);
				margin: 0 0 8px 0;
				padding-bottom: 4px;
				border-bottom: 1px solid var(--uui-color-border, #e0e0e0);
			}

			.c-ai-section {
				margin-top: 24px;
				padding-top: 20px;
				border-top: 2px solid var(--uui-color-border, #e0e0e0);
			}

			.c-ai-section__header {
				display: flex;
				align-items: center;
				gap: 8px;
				margin-bottom: 12px;
			}

			.c-ai-section__title {
				font-size: 1.1em;
				font-weight: 600;
				margin: 0;
			}
    	`,
	];
}

declare global {
	interface HTMLElementTagNameMap {
		'ar-manual-tests': ARManualTestsElement;
	}
}
