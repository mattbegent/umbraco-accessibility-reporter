import { LitElement, css, html, customElement} from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";

@customElement('accessibility-reporter-workspaceview')
export class AccessibilityReporterWorkspaceViewElement extends UmbElementMixin(LitElement) {

  render() {
    return html`
      <uui-box headline="Hello">
        <p>This is the Accessibility Reporter Workspace view</p>
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

export default AccessibilityReporterWorkspaceViewElement;

declare global {
  interface HTMLElementTagNameMap {
    'accessibility-reporter-workspaceview': AccessibilityReporterWorkspaceViewElement;
  }
}