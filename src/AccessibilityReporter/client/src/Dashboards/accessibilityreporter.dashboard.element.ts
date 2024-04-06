import { LitElement, css, html, customElement} from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";

@customElement('accessibility-reporter-dashboard')
export class AccessibilityReporterDashboardElement extends UmbElementMixin(LitElement) {

  render() {
    return html`
      <ar-pre-test></ar-pre-test>

      <ar-running-tests></ar-running-tests>

      <ar-errored></ar-errored>

      <ar-has-results></ar-has-results>

      <uui-box headline="Hello">
        <ar-logo></ar-logo>
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