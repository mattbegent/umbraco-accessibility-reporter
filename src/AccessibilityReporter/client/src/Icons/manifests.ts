export const manifests: Array<UmbExtensionManifest> = [
    {
        type: 'icons',
        alias: 'AccessibilityReporter.Icons',
        name: 'Accessibility Reporter Icons',
        js: () => import('./icons.js'),
    }
];
