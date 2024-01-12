import IConfig from "../interface/IConfig";

export default class AccessibilityReporterAPIService {

	static async getIssues(config: IConfig, testUrl: string, language: string) {
		let requestUrl = new URL(config.apiUrl);
		requestUrl.searchParams.append("url", testUrl);
		if (language) {
			requestUrl.searchParams.append("language", language);
		}
		if (config.testsToRun) {
			for (let index = 0; index < config.testsToRun.length; index++) {
				requestUrl.searchParams.append("tags", config.testsToRun[index]);
			}
		}
		const response = await fetch(requestUrl.toString());
		const audit = await response.json();
		return audit;
	}

	static async getConfig() {

		// TODO: Temp because routing not working on API
		return {
			"apiUrl": "",
			"testBaseUrl": "",
			"testsToRun": [
				"wcag2a",
				"wcag2aa",
				"wcag21a",
				"wcag21aa",
				"wcag22aa",
				"best-practice"
			],
			"userGroups": [
				"admin",
				"editor",
				"writer",
				"translator",
				"sensitiveData"
			],
			"runTestsAutomatically": true,
			"includeIfNoTemplate": false,
			"maxPages": 50
		};

		const response = await fetch('/umbraco/backoffice/api/config/current', {
			credentials: 'include'
		});
		const config = await response.json();
		return config;
	}

	static async getPages() {

		// TODO: Temp because routing not working on API
		return [
			{
				"guid": "1c9c08e6-3dda-44c5-aa85-08f2949a4658",
				"id": 15370,
				"name": "Homepage",
				"docTypeAlias": "sitePage",
				"url": "https://localhost:44318/"
			},
			{
				"guid": "1c9c08e6-3dda-44c5-aa85-08f2949a4658",
				"id": 15371,
				"name": "404",
				"docTypeAlias": "sitePage2",
				"url": "https://localhost:44318/404"
			}];

		const response = await fetch('/umbraco/backoffice/api/directory/pages', {
			credentials: 'include'
		});
		const pages = await response.json();
		return pages;
	}

}
