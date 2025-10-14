//import { ManifestWorkspaceView } from "@umbraco-cms/backoffice/extension-registry";
//import { TemplateSetConditionConfig } from "../Conditions/accessibilityreporter.condition.templateset.js";

const workspaceView: UmbExtensionManifest = {
    alias: 'AccessibilityReporter.WorkspaceView',
    name: 'Accessibility Reporter Workspace View',
    type: 'workspaceView',
    element: () => import('./accessibilityreporter.workspaceview.element.js'),
    weight: 190,
    meta: {
        icon: 'icon-people',
        label: 'Accessibility',
        pathname: 'accessibility-reporter',
    },
    conditions: [
        {
            alias: 'Umb.Condition.WorkspaceAlias',
            match: 'Umb.Workspace.Document',
        },
        {
            alias: 'AccessibilityReporter.Condition.TemplateSet' // This has no config as we check against user config calling the C# API
        },
        {
            alias: 'AccessibilityReporter.Condition.UserGroupHasAccess' // This has no config as we check against user config calling the C# API
        }
    ],
}
export const manifests = [workspaceView];
