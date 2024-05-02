import { UmbEntryPointOnInit } from '@umbraco-cms/backoffice/extension-api';
import { manifests as conditionManifests } from './Conditions/manifests';
import { manifests as dashboardManifests } from './Dashboards/manifests';
import { manifests as workspaceViewManifests } from './WorkspaceView/manifests';
import { manifests as modalManifests } from './Modals/manifests';
import { UMB_AUTH_CONTEXT } from '@umbraco-cms/backoffice/auth';
import { OpenAPI } from "./Api";

// load up the manifests here
export const onInit: UmbEntryPointOnInit = (_host, extensionRegistry) => {

    // We can register many manifests at once via code
    // as opposed to a long umbraco-package.json file
    extensionRegistry.registerMany([
        ...conditionManifests,
        ...dashboardManifests,
        ...workspaceViewManifests,
        ...modalManifests
    ]);

     // Do the OAuth token handshake stuff
     _host.consumeContext(UMB_AUTH_CONTEXT, (authContext) => {
        const config = authContext.getOpenApiConfiguration();

        console.log('OpenAPI Configuration', config);

        OpenAPI.BASE = config.base;
        OpenAPI.WITH_CREDENTIALS = config.withCredentials;
        OpenAPI.CREDENTIALS = config.credentials;
        OpenAPI.TOKEN = config.token;
    });
};
