interface IViolationPreview {
	id: string;
	impact: string;
	tags: string[];
	nodes: string[];
	title?: string;
	description?: string;
}

export default IViolationPreview;
