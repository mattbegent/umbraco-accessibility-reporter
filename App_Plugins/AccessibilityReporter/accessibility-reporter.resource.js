angular
.module('umbraco.resources')
.factory('AccessibilityReporterApiService',
	function ($q, $http, umbRequestHelper) {
		return {
			getIssues: function (url) {
				return umbRequestHelper.resourcePromise(
					$http.get("https://api.accessibilityreporter.com?url=" + url),
					"Failed to retrieve Accessibility Audit"
				);
			}
		};
	}
);
