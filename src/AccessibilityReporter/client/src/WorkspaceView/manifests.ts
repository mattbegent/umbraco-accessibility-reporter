import { ManifestWorkspaceView } from "@umbraco-cms/backoffice/extension-registry";
import { TemplateSetConditionConfig } from "../Conditions/accessibiltyreporter.condition.templateset.js";

const workspaceView: ManifestWorkspaceView = {
    alias: 'AccessibilityReporter.WorkspaceView',
    name: 'Accessibility Reporter Workspace View',
    type: 'workspaceView',
    js: () => import('./accessibilityreporter.workspaceview.element.js'),
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
            alias: 'AccessibilityReporter.Condition.TemplateSet',
            hasTemplateSet: true
        } as TemplateSetConditionConfig,
        // {
        //     alias: 'AccessibilityReporter.Condition.UserGroupHasAccess' // This has no config as we check against user config calling the C# API
        // }
    ],
}
export const manifests = [workspaceView];
