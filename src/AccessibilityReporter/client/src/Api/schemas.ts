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