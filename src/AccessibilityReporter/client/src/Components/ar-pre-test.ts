import { LitElement, html, customElement, property, css } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import './ar-logo';
import { generalStyles } from "../Styles/general";
import type { UmbLanguageDetailModel } from "@umbraco-cms/backoffice/language";

@customElement("ar-pre-test")
export class ARPreTestElement extends UmbElementMixin(LitElement) {

	@property()
	onRunTests = () => { };

	@property()
	onCultureChange = (_culture: string) => { };

	@property({ attribute: false })
	availableLanguages: UmbLanguageDetailModel[] = [];

	@property()
	selectedCulture: string = '';

	private _handleCultureChange(e: Event) {
		const select = e.target as HTMLSelectElement;
		this.onCultureChange(select.value);
	}

	render() {
		const showPicker = this.availableLanguages.length > 1;
		return html`
		<uui-scroll-container>
			<uui-box>
				<div slot="headline" class="c-title__group">
					<ar-logo></ar-logo>
					<h2 class="c-title">Accessibility Reporter</h2>
				</div>
				<p>Start running accessibility tests against multiple pages by using the button below.</p>
				<p>While the tests are running please stay on this page.</p>
				${showPicker ? html`
				<div class="c-language-picker">
					<label for="ar-language-select" class="c-language-picker__label">Language variant to test:</label>
					<select id="ar-language-select" class="c-language-picker__select" .value=${this.selectedCulture} @change=${this._handleCultureChange}>
						<option value="">Default</option>
						${this.availableLanguages.map(lang => html`
							<option value=${lang.unique} ?selected=${lang.unique === this.selectedCulture}>
								${lang.name}${lang.isDefault ? ' (default)' : ''}
							</option>
						`)}
					</select>
				</div>
				` : null}
				<uui-button look="primary" color="default" @click="${this.onRunTests}" label="Run accessibility tests on current live pages" class="c-summary__button" style="margin-top: 20px;">Run tests</uui-button>
			</uui-box>
		</uui-scroll-container>
		`;
	}

	static styles = [
		generalStyles,
		css`
			.c-language-picker {
				display: flex;
				align-items: center;
				gap: 10px;
				margin-top: 10px;
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
		`
	];
}

declare global {
	interface HTMLElementTagNameMap {
		"ar-pre-test": ARPreTestElement;
	}
}