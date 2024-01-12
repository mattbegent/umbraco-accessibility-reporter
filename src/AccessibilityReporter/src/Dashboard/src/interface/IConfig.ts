interface IConfig {
	apiUrl: string;
	testBaseUrl: string;
	testsToRun: string[];
	userGroups: string[];
	runTestsAutomatically: boolean,
	includeIfNoTemplate: boolean,
	maxPages: number;
}

export default IConfig;
