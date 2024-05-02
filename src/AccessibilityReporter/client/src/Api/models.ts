export type AccessibilityReporterAppSettings = {
	apiUrl: string;
	testBaseUrl: string;
	runTestsAutomatically: boolean;
	includeIfNoTemplate: boolean;
	maxPages: number;
	userGroups: Array<string>;
	testsToRun: Array<string>;
	excludedDocTypes: Array<string>;
};



export type NodeSummary = {
	readonly guid: string;
	readonly id: number;
	readonly name: string;
	readonly docTypeAlias: string;
	url: string;
};

