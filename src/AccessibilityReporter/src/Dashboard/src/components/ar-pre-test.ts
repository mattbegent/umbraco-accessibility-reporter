import { LitElement, html, customElement, property } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import './ar-logo';
import { generalStyles } from "../styles/general";

@customElement("ar-pre-test")
export class ARPreTestElement extends UmbElementMixin(LitElement) {

	@property()
	onRunTests = () => { };

	render() {
		return html`
		<uui-scroll-container>
			<uui-box>
				<div slot="headline" class="c-title__group">
					<ar-logo></ar-logo>
					<h2 class="c-title">Accessibility Reporter</h2>
				</div>
				<p>Start running accessibility tests against multiple pages by using the button below.</p>
				<p style="margin-bottom: 20px;">While the tests are running please stay on this page.</p>
				<uui-button look="primary" color="default" @click="${this.onRunTests}" label="Run accessibility tests on current live pages" class="c-summary__button">Run tests</uui-button>
			</uui-box>
		</uui-scroll-container>
		`;
	}

	static styles = [
		generalStyles
	];
}

declare global {
	interface HTMLElementTagNameMap {
		"ar-pre-test": ARPreTestElement;
	}
}
