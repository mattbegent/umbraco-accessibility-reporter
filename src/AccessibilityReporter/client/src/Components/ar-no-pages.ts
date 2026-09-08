import { LitElement, html, customElement, property } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import './ar-logo';
import { generalStyles } from "../Styles/general";

@customElement("ar-no-pages")
export class ARNoPagesElement extends UmbElementMixin(LitElement) {

	@property()
	onRunTests = () => { };

	@property()
	culture: string = '';

	render() {
		return html`
		<uui-scroll-container>
			<uui-box>
                <div slot="headline" class="c-title__group">
                    <ar-logo></ar-logo>
                    <h2 class="c-title">No pages found</h2>
                </div>
                <p>${this.culture
					? html`We couldn't find any publicly accessible pages to test for the <strong>${this.culture}</strong> language variant.`
					: html`We couldn't find any publicly accessible pages to test.`}</p>
                <p>Check that this language variant has published content, then try again using the "Rerun Tests" button below.</p>
                <uui-button look="primary" color="default" @click="${this.onRunTests}" label="Rerun accessibility tests" class="c-summary__button" style="margin-top: 20px;">Rerun tests</uui-button>
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
		"ar-no-pages": ARNoPagesElement;
	}
}
