import { ManifestWorkspaceView } from "@umbraco-cms/backoffice/extension-registry";
import { TemplateSetConditionConfig } from "../Conditions/accessibiltyreporter.condition.templateset.js";

const workspaceView: ManifestWorkspaceView = {
    alias: 'accessibilityreporter.workspaceview',
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
        } as TemplateSetConditionConfig
    ],
}
export const manifests = [workspaceView];
