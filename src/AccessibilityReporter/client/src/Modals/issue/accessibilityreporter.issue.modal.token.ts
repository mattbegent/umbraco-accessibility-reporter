import { UmbModalToken } from "@umbraco-cms/backoffice/modal";
import IIssueSummary from "../../Interface/IIssueSummary";

export interface IssueModalData {
	issue: IIssueSummary;
	isMultisite: boolean;
	// Used to open each page in the culture that was tested.
	culture?: string;
	userLanguage?: string;
}

export interface IssueModalValue {}

export const ACCESSIBILITY_REPORTER_MODAL_ISSUE = new UmbModalToken<IssueModalData, IssueModalValue>('AccessibilityReporter.Modal.Issue', {
	modal: {
		type: 'sidebar',
		size: 'large'
	}
});
