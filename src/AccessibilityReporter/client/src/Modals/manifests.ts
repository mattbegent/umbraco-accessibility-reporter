const detailModal: UmbExtensionManifest = {
    type: 'modal',
    alias: 'AccessibilityReporter.Modal.Detail',
    name: 'Accessibility Reporter Modal - Detail',
    element: () => import('./detail/accessibilityreporter.detail.element')
}
export const manifests = [detailModal];
