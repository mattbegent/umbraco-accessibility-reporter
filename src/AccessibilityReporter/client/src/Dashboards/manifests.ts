const dashboard: UmbExtensionManifest = {
    alias: 'AccessibilityReporter.Dashboard',
    name: 'Accessibility Reporter Dashboard',
    type: 'dashboard',
    weight: 2,
	element: () => import('./accessibilityreporter.dashboard.element.js'),
    meta: {
        label: 'Accessibility Reporter',
        pathname: 'accessibility-reporter'
    },
    conditions: [
        {
            alias: 'Umb.Condition.SectionAlias',
            match: 'Umb.Section.Content'
        },
		{
            alias: 'AccessibilityReporter.Condition.UserGroupHasAccess'
        }
    ]

}

const historyDashboard: UmbExtensionManifest = {
    alias: 'AccessibilityReporter.HistoryDashboard',
    name: 'Accessibility History Dashboard',
    type: 'dashboard',
    weight: 1,
	element: () => import('./ar-site-history-dashboard.js'),
    meta: {
        label: 'Accessibility History',
        pathname: 'accessibility-reporter-history'
    },
    conditions: [
        {
            alias: 'Umb.Condition.SectionAlias',
            match: 'Umb.Section.Content'
        },
		{
            alias: 'AccessibilityReporter.Condition.UserGroupHasAccess'
        }
    ]

}

export const manifests = [dashboard, historyDashboard];
