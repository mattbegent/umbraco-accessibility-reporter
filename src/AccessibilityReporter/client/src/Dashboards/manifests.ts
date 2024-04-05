import { ManifestDashboard } from "@umbraco-cms/backoffice/extension-registry";

const dashboard: ManifestDashboard = {
    alias: 'accessibilityreporter.dashboard',
    name: 'Accessibility Reporter Dashboard',
    type: 'dashboard',
    weight: 400,
    js: () => import('./accessibilityreporter.dashboard.element.js'),
    meta: {
        label: 'Accessibility Reporter',
        pathname: 'accessibility-reporter'
    },
    conditions: [
        {
            alias: 'Umb.Condition.SectionAlias',
            match: 'Umb.Section.Content'
        }
    ]
   
}
export const manifests = [dashboard];