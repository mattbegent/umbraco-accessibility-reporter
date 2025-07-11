const dashboard: UmbExtensionManifest = {
    alias: 'AccessibilityReporter.Dashboard',
    name: 'Accessibility Reporter Dashboard',
    type: 'dashboard',
    weight: 400,
	element: () => import('./accessibilityreporter.dashboard.element.js'),
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
