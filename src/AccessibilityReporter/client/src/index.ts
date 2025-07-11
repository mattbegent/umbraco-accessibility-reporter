import { UmbEntryPointOnInit, UmbEntryPointOnUnload } from '@umbraco-cms/backoffice/extension-api';
import { manifests as conditionManifests } from './Conditions/manifests';
import { manifests as dashboardManifests } from './Dashboards/manifests';
import { manifests as workspaceViewManifests } from './WorkspaceView/manifests';
import { manifests as modalManifests } from './Modals/manifests';
import { UMB_AUTH_CONTEXT } from '@umbraco-cms/backoffice/auth';
import { client } from "./api/client.gen.js";

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

	_host.consumeContext(UMB_AUTH_CONTEXT, async (authContext) => {
		// Get the token info from Umbraco
		const config = authContext?.getOpenApiConfiguration();

		client.setConfig({
		auth: config?.token ?? undefined,
		baseUrl: config?.base ?? "",
		credentials: config?.credentials ?? "same-origin",
		});
	});
};

export const onUnload: UmbEntryPointOnUnload = (_host, _extensionRegistry) => {
  console.log("Goodbye from Accessibility Reporter 👋");
};
