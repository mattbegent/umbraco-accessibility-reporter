import { LitElement, css, html, customElement, state} from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import { tryExecuteAndNotify } from '@umbraco-cms/backoffice/resources';
import { ConfigService, NodeSummary } from '../Api';

@customElement('accessibility-reporter-dashboard')
export class AccessibilityReporterDashboardElement extends UmbElementMixin(LitElement) {

  @state()
  config : NodeSummary[] | undefined;

  private clickyClick() {
    console.log('clicked button');

    this._getServerStuff().then((_config) => {
      this.config = _config;
    });
  }


  private async _getServerStuff() : Promise<NodeSummary[] | undefined> {
    // ConfigService.Current from the generated API client from the OpenApi spec is doing the fetch to the server
    const { data, error } = await tryExecuteAndNotify(this,  ConfigService.current())
    if (error){
        console.error(error);
        return undefined;
    }
    
    return data;
  }



  render() {
    return html`
      <uui-button look="primary" color="danger" @click="${this.clickyClick}">Server Thing</uui-button>

      <uui-box headline="Config">
        <pre>${JSON.stringify(this.config, null, 4)}</pre>
      </uui-box>

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