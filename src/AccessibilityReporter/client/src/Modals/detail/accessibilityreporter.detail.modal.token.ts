
import { UmbModalToken } from "@umbraco-cms/backoffice/modal";

// The data we pass into the modal
export interface DetailModalData {
    result: object; // TODO: Be nice to use a type for the result rather than an obj
}

export interface DetailModalValue {
    // If the modal is to return any data back on submission
    thing: string;
}

export const ACCESSIBILITY_REPORTER_MODAL_DETAIL = new UmbModalToken<DetailModalData, DetailModalValue>('AccessibilityReporter.Modal.Detail', {
    modal: {
        type: 'sidebar',
        size: 'full' // full, large, medium, small
    }
});