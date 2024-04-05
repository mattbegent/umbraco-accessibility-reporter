import { ManifestWorkspaceView } from "@umbraco-cms/backoffice/extension-registry";

const workspaceView: ManifestWorkspaceView = {
    alias: 'accessibilityreporter.workspaceview',
    name: 'Accessibility Reporter Workspace View',
    type: 'workspaceView',
    js: () => import('./accessibilityreporter.workspaceview.element.js'),
    weight: 190,
    meta: {
        icon: 'icon-people',
        label: 'Accessibility',
        pathname: 'accessibility-reporter'
    },
    conditions: [
        {
            alias: 'Umb.Condition.WorkspaceAlias',
            match: 'Umb.Workspace.Document',
        },
    ],
}
export const manifests = [workspaceView];