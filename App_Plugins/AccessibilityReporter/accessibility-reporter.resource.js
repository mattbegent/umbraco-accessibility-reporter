angular
.module('umbraco.resources')
.factory('AccessibilityReporterApiService',
    function ($q, $http, umbRequestHelper) {
        return {
            getIssues: function (config, pathnameToTest, language) {
                let requestUrl = new URL(config.apiUrl);
                let testUrl = new URL(pathnameToTest, config.testBaseUrl);
                requestUrl.searchParams.append('url', testUrl.toString());
                if(language) {
                    requestUrl.searchParams.append('language', language);
                }
                if (config.tags) {
                    for (var i = 0; i < config.tags.length; i++) {
                        requestUrl.searchParams.append('tags', config.tags[i]);
                    }
                }
                return umbRequestHelper.resourcePromise(
                    $http.get(requestUrl.toString()),
                    'Failed to retrieve Accessibility Audit'
                );
            },
            getConfig: function () {
                return umbRequestHelper.resourcePromise(
                    $http.get('/App_Plugins/AccessibilityReporter/config.json'),
                    'Failed to retrieve Accessibility Reporter config'
                );
            }
        };
    }
);
