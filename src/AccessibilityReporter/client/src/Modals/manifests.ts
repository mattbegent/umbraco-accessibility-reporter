const detailModal: UmbExtensionManifest = {
    type: 'modal',
    alias: 'AccessibilityReporter.Modal.Detail',
    name: 'Accessibility Reporter Modal - Detail',
    element: () => import('./detail/accessibilityreporter.detail.element')
}

const readabilityModal: UmbExtensionManifest = {
    type: 'modal',
    alias: 'AccessibilityReporter.Modal.Readability',
    name: 'Accessibility Reporter Modal - Readability',
    element: () => import('./readability/accessibilityreporter.readability.element')
}

export const manifests = [detailModal, readabilityModal];
