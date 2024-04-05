import { LitElement, css, html, customElement} from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";

@customElement('accessibility-reporter-dashboard')
export class AccessibilityReporterDashboardElement extends UmbElementMixin(LitElement) {

  render() {
    return html`
      <uui-box headline="Hello">
        <p>This is the Accessibility Reporter Dashboard</p>
      </uui-box>
    `;
  }

  static styles = [
    css`
      :host {
        display: block;
        padding: 24px;
      }
    `,
  ];
}

export default AccessibilityReporterDashboardElement;

declare global {
  interface HTMLElementTagNameMap {
    'accessibility-reporter-dashboard': AccessibilityReporterDashboardElement;
  }
}