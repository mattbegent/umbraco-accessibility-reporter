import { ManifestModal } from "@umbraco-cms/backoffice/extension-registry";

const detailModal: ManifestModal = {
    type: 'modal',
    alias: 'AccessibilityReporter.Modal.Detail',
    name: 'Accessibility Reporter Modal - Detail',
    js: () => import('./detail/accessibilityreporter.detail.element') 
}
export const manifests = [detailModal];