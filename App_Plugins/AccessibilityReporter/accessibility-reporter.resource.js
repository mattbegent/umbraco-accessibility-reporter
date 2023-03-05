angular
.module('umbraco.resources')
.factory('AccessibilityReporterApiService',
	function ($q, $http, umbRequestHelper) {
		return {
			getIssues: function (url, language) {
				let requestUrl = new URL('https://api.accessibilityreporter.com/api/audit');
				requestUrl.searchParams.append('url', url);
				if(language) {
					requestUrl.searchParams.append('language', language);
				}
				return umbRequestHelper.resourcePromise(
					$http.get(requestUrl.toString()),
					'Failed to retrieve Accessibility Audit'
				);
			}
		};
	}
);
