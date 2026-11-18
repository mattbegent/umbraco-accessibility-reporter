// One accessibility rule that failed, rolled up across every tested page.
export interface IIssuePage {
	guid: string;
	name: string;
	url: string;
	rootName: string;
	score: number;
	instances: number;
}

// The same element (matching selector and HTML) failing the rule on more than one page,
// which usually means it comes from a shared template, partial or component.
export interface ISharedElement {
	target: string;
	html: string;
	pageCount: number;
	instances: number;
}

interface IIssueSummary {
	id: string;
	title: string;
	description: string;
	impact: string;
	tags: string[];
	helpUrl?: string;
	instances: number;
	pages: IIssuePage[];
	sharedElements: ISharedElement[];
	// False when the saved results predate element details being stored.
	hasElementDetails: boolean;
}

export default IIssueSummary;
