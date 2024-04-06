import { UmbEntryPointOnInit } from '@umbraco-cms/backoffice/extension-api';
import { manifests as dashboardManifests } from './Dashboards/manifests';
import { manifests as workspaceViewManifests } from './WorkspaceView/manifests';

export * from "./Components/index";

// load up the manifests here
export const onInit: UmbEntryPointOnInit = (_host, extensionRegistry) => {
    
    // We can register many manifests at once via code 
    // as opposed to a long umbraco-package.json file
    extensionRegistry.registerMany([
        ...dashboardManifests,
        ...workspaceViewManifests
    ]);
};