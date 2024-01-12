import { LitElement, html, customElement } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";

@customElement("ar-logo")
export class ARLogoElement extends UmbElementMixin(LitElement) {

	render() {
		return html`
			<svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" style="enable-background:new 0 0 24 24" viewBox="0 0 24 24" width="42" height="42">
				<path d="M12 22c5.5 0 10-4.5 10-10S17.5 2 12 2 2 6.5 2 12s4.5 10 10 10z" style="fill:#ffffff;stroke:#443b52;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round" />
				<path d="m7 9 5 1m5-1-5 1m0 0v3m0 0-2 5m2-5 2 5" style="fill:none;stroke:#443b52;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round" />
				<path d="M12 8.5c-.7 0-1.2-.6-1.2-1.3S11.3 6 12 6s1.2.6 1.2 1.2-.5 1.3-1.2 1.3z" style="fill:#443b52" />
			</svg>
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		"ar-logo": ARLogoElement;
	}
}
