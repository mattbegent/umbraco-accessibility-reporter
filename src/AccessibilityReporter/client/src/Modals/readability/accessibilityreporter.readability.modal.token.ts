import { UmbModalToken } from "@umbraco-cms/backoffice/modal";

export interface ReadabilityModalData {
    /** The current HTML content from the rich text editor. */
    html: string;
    /** Base URL for the Umbraco back-office API. */
    apiBaseUrl: string;
    /** Bearer token for authenticated API calls. */
    authToken: string;
}

export interface ReadabilityModalValue {
    /** The approved (improved) HTML to replace the editor content with. */
    approvedHtml?: string;
}

export const ACCESSIBILITY_REPORTER_READABILITY_MODAL = new UmbModalToken<ReadabilityModalData, ReadabilityModalValue>(
    'AccessibilityReporter.Modal.Readability',
    {
        modal: {
            type: 'sidebar',
            size: 'large'
        }
    }
);
