angular
  .module("umbraco.resources")
  .factory(
    "AccessibilityReporterApiService",
    function ($q, $http, umbRequestHelper) {
      return {
        getIssues: function (config, pathnameToTest, language) {
          let requestUrl = new URL(config.apiUrl);
          let testUrl = new URL(pathnameToTest, config.testBaseUrl);
          requestUrl.searchParams.append("url", testUrl.toString());
          if (language) {
            requestUrl.searchParams.append("language", language);
          }
          if (config.testsToRun) {
            for (var i = 0; i < config.testsToRun.length; i++) {
              requestUrl.searchParams.append("tags", config.testsToRun[i]);
            }
          }
          return umbRequestHelper.resourcePromise(
            $http.get(requestUrl.toString()),
            "Failed to retrieve Accessibility Audit"
          );
        },
        getConfig: function () {
          return umbRequestHelper.resourcePromise(
            $http.get("/umbraco/backoffice/api/config/current"),
            "Failed to retrieve Accessibility Reporter config"
          );
        },
      };
    }
  );
