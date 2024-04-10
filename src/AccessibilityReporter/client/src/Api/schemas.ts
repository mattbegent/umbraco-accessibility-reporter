export const $AccessibilityReporterAppSettings = {
	properties: {
		apiUrl: {
	type: 'string',
	isRequired: true,
},
		testBaseUrl: {
	type: 'string',
	isRequired: true,
},
		runTestsAutomatically: {
	type: 'boolean',
	isRequired: true,
},
		includeIfNoTemplate: {
	type: 'boolean',
	isRequired: true,
},
		maxPages: {
	type: 'number',
	isRequired: true,
	format: 'int32',
},
		userGroups: {
	type: 'array',
	contains: {
	type: 'string',
},
	isRequired: true,
},
		testsToRun: {
	type: 'array',
	contains: {
	type: 'string',
},
	isRequired: true,
},
		excludedDocTypes: {
	type: 'array',
	contains: {
	type: 'string',
},
	isRequired: true,
},
	},
} as const;

export const $NodeSummary = {
	properties: {
		guid: {
	type: 'string',
	isReadOnly: true,
	isRequired: true,
	format: 'uuid',
},
		id: {
	type: 'number',
	isReadOnly: true,
	isRequired: true,
	format: 'int32',
},
		name: {
	type: 'string',
	isReadOnly: true,
	isRequired: true,
},
		docTypeAlias: {
	type: 'string',
	isReadOnly: true,
	isRequired: true,
},
		url: {
	type: 'string',
	isRequired: true,
},
	},
} as const;