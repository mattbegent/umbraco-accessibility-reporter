
import { UmbModalToken } from "@umbraco-cms/backoffice/modal";

// The data we pass into the modal
export interface DetailModalData {
	result: {
		id: string;
		impact: string;
		tags: string[];
		description: string;
		help: string;
		helpUrl: string;
		nodes: {
			any: IssueNode[];
			all: string[];
			none: string[];
			impact: string;
			html: string;
			target: string[];
			failureSummary: string;
		}[];
	};
};

export interface IssueNode {
	id: string;
	data: string
	relatedNodes: IssueNode[];
	impact: string;
	message: string;
	html: string;
}

export interface DetailModalValue {
	// If the modal is to return any data back on submission
	thing: string;
}

export const ACCESSIBILITY_REPORTER_MODAL_DETAIL = new UmbModalToken<DetailModalData, DetailModalValue>('AccessibilityReporter.Modal.Detail', {
	modal: {
		type: 'sidebar',
		size: 'large' // full, large, medium, small
	}
});
