import { LitElement, html, customElement, property } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import './ar-logo';
import { generalStyles } from "../styles/general";

@customElement("ar-running-tests")
export class ARRunningTestsElement extends UmbElementMixin(LitElement) {

	@property({ type: String })
	currentTestUrl: string | undefined;

	@property({ type: Number })
	currentTestNumber: number | undefined;

	@property({ type: Number })
	testPagesTotal: number | undefined;

	@property()
	onStopTests = () => { };

	render() {
		return html`
		<uui-scroll-container>
			<uui-box>
				<div slot="headline" class="c-title__group">
					<ar-logo></ar-logo>
					<h2 class="c-title" aria-live="polite">Running accessibility tests ${this.currentTestUrl ? html`on` : null} ${this.currentTestUrl} ${this.currentTestNumber ? html`(${this.currentTestNumber}/${this.testPagesTotal})` : ''}</h2>
				</div>
				<p class="alert alert-info">Please stay on this page while the tests are running.</p>
				<uui-button look="primary" color="default" @click="${this.onStopTests}"  label="Cancel running accessibility tests" class="u-mb20">Cancel running tests</uui-button>
				<uui-loader-bar animationDuration="1.5" style="color: #443b52"></uui-loader-bar>
				<slot></slot>
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
		"ar-running-tests": ARRunningTestsElement;
	}
}
