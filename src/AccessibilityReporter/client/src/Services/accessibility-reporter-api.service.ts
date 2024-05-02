import { AccessibilityReporterAppSettings } from "../Api";

export default class AccessibilityReporterAPIService {

	static async getIssues(config: AccessibilityReporterAppSettings, testUrl: string, language: string) {
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
