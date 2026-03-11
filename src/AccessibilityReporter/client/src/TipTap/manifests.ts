export const manifests: Array<UmbExtensionManifest> = [
    {
        type: 'tiptapToolbarExtension',
        kind: 'button',
        alias: 'AccessibilityReporter.Tiptap.Toolbar.Readability',
        name: 'Accessibility Reporter Readability Toolbar Extension',
        api: () => import('./readability.tiptap-toolbar-api.js'),
        meta: {
            alias: 'accessibilityReporterReadability',
            icon: 'icon-school',
            label: 'Readability',
        }
    }
];
