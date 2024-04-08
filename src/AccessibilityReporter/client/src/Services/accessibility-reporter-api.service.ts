import IConfig from "../Interface/IConfig";

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

}
