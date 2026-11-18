const detailModal: UmbExtensionManifest = {
    type: 'modal',
    alias: 'AccessibilityReporter.Modal.Detail',
    name: 'Accessibility Reporter Modal - Detail',
    element: () => import('./detail/accessibilityreporter.detail.element')
}

const issueModal: UmbExtensionManifest = {
    type: 'modal',
    alias: 'AccessibilityReporter.Modal.Issue',
    name: 'Accessibility Reporter Modal - Issue',
    element: () => import('./issue/accessibilityreporter.issue.element')
}

export const manifests = [detailModal, issueModal];
