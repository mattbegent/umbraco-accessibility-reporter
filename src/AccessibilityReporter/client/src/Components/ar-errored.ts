import { LitElement, html, customElement, property } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import './ar-logo';
import { generalStyles } from "../Styles/general";

@customElement("ar-errored")
export class ARErroredElement extends UmbElementMixin(LitElement) {

	@property()
	onRunTests = () => { };

	render() {
		return html`
		<uui-scroll-container>
			<uui-box>
                <div slot="headline" class="c-title__group">
                    <ar-logo></ar-logo>
                    <h2 class="c-title">Accessibility Report errored</h2>
                </div>
                <p>Accessibility Reporter only works for URLs that are accessible publicly.</p>
                <p>If your page is publicly accessible, please try using the "Rerun Tests" button below or refreshing this page to run the accessibility report again.</p>
                <uui-button look="primary" color="default" @click="${this.onRunTests}" label="Rerun accessibility tests on current live page">Rerun tests</uui-button>
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
		"ar-errored": ARErroredElement;
	}
}