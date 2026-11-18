export interface IViolationNodePreview {
	impact: string;
	// Selector and trimmed HTML for the element. Only kept for the first few elements of each
	// violation, and missing from results saved by older versions.
	target?: string;
	html?: string;
}

interface IViolationPreview {
	id: string;
	impact: string;
	tags: string[];
	nodes: IViolationNodePreview[];
	title?: string;
	description?: string;
	helpUrl?: string;
}

export default IViolationPreview;
