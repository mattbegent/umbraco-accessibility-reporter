angular.module("umbraco")
	.controller("My.AccessibilityReporterApp", function ($scope, editorState, userService, contentResource, AccessibilityReporterService, AccessibilityReporterApiService, editorService, notificationsService) {

        $scope.config = {};
        $scope.pageState = "loading";
        $scope.testUrl = "";
        $scope.testPathname = "";
        $scope.violationsOpen = true;
        $scope.incompleteOpen = true;
        $scope.passesOpen = false;
        $scope.userLocale;
        $scope.accessibilityReporterService = AccessibilityReporterService;

        function init() {
            AccessibilityReporterApiService.getConfig()
                .then(function (config) {
                    $scope.config = config;
                    if (!config.testBaseUrl) {
                        $scope.config.testBaseUrl = getFallbackBaseUrl();
                    }
                })
                .then(function () {
                    return userService.getCurrentUser();
                })
                .then(function (user) {
                    if (
                        $scope.config.userGroups &&
                        !user.userGroups.some((group) =>
                            $scope.config.userGroups.includes(group)
                        )
                    ) {
                        $scope.pageState = "unauthorised";
                        throw new Error("User not in allowed group.");
                    }
                    $scope.userLocale = user && user.locale ? user.locale : undefined;

                    if ($scope.config.runTestsAutomatically) {
                        $scope.runTests();
                    } else {
                        $scope.pageState = "manuallyrun";
                    }

                })
                .catch(handleError);
        }

        function getPageName() {
            return editorState.current && editorState.current.variants.length ? editorState.current.variants[0].name : 'Current page';
        }

        function isAbsoluteURL(urlString) {
            return urlString.indexOf('http://') === 0 || urlString.indexOf('https://') === 0;
        }

        function getHostnameFromString(url) {
            return new URL(url).hostname;
        }

        function getHostname(possibleUrls) {
            if (location.hostname.indexOf('localhost') !== -1) {
                return getLocalHostname();
            }
            for(var i=0; i < possibleUrls.length; i++){
                var possibleCurrentUrl = possibleUrls[i].text; 
                if(isAbsoluteURL(possibleCurrentUrl)) {
                    return getHostnameFromString(possibleCurrentUrl);
                }
            }
            // fallback if hostnames not set assume current host
            return getLocalHostname();
        }

        function getLocalHostname() {
            return location.hostname + (location.port ? ":" + location.port : "");
        }

        function hasRoutes() {
            for (var i = 0; i < editorState.current.urls.length; i++) {
                if (editorState.current.urls[i].isUrl) {
                    return true;
                }
            }
            return false;
        }

        function getFallbackBaseUrl() {
            return location.protocol + "//" + getHostname(editorState.current.urls);
        }

        function sortResponse(results) {
            
            var sortedViolations = results.violations.sort(AccessibilityReporterService.sortIssues);
            results.violations = sortedViolations;
            var sortedIncomplete = results.incomplete.sort(AccessibilityReporterService.sortIssues);
            results.incomplete = sortedIncomplete;
            return results;
        }

        $scope.runTests = function() {
            $scope.pageState = "loading";
            $scope.pageName = getPageName();

            return contentResource.getNiceUrl(editorState.current.id)
            .then(function (data) {
                if (!hasRoutes()) {
                    throw new Error('Page URL cannot be routed');
                }
                if (isAbsoluteURL(data)) {
                    $scope.testPathname = new URL(data).pathname;
                } else {
                    $scope.testPathname = data;
                }
                return data;
            })
            .then(function() {
                $scope.testUrl = new URL(
                    $scope.testPathname,
                    $scope.config.testBaseUrl
                ).toString();
                return $scope.config.apiUrl ? AccessibilityReporterApiService.getIssues($scope.config, $scope.testUrl, $scope.userLocale) : AccessibilityReporterService.runTest($scope.testUrl);
            })
            .then(function (response) {
              if (response) {
                $scope.results = sortResponse(response);
                $scope.model.badge = {
                  count: $scope.results.violations.length,
                  type: $scope.results.violations.length ? "alert" : "default",
                };
                $scope.testTime = moment(response.timestamp).format(
                    "HH:mm:ss"
                );
                $scope.testDate = moment(response.timestamp).format(
                    "MMMM Do YYYY"
                );
                $scope.pageState = "loaded";
              } else {
                throw new Error('Error getting test results.');
              }
              
            })
            .catch(handleError);
        }

        function handleError() {
            if ($scope.pageState !== "unauthorised") {
                $scope.pageState = "errored";
            }
        }
    
        $scope.totalIssues = function() {
            if(!$scope.results) {
                return 0;
            }

            var total = 0;

            for(var i=0; i < $scope.results.violations.length; i++){
                total += $scope.results.violations[i].nodes.length;
            }

            return total.toString();
        };

        $scope.totalPassed = function() {
            if(!$scope.results) {
                return 0;
            }
            return $scope.results.passes.length.toString();
        };

        $scope.totalIncomplete = function() {
            if(!$scope.results) {
                return 0;
            }
            var total = 0;

            for(var i=0; i < $scope.results.incomplete.length; i++){
                total += $scope.results.incomplete[i].nodes.length;
            }

            return total.toString();
        };

        $scope.toggleViolations = function() {
            $scope.violationsOpen  = !$scope.violationsOpen;
        };

        $scope.togglePasses = function() {
            $scope.passesOpen  = !$scope.passesOpen;
        };

        $scope.toggleIncomplete = function() {
            $scope.incompleteOpen  = !$scope.incompleteOpen;
        };

        $scope.openDetail = function(result) {
            editorService.open({
                view: "/App_Plugins/AccessibilityReporter/accessibility-reporter-detail.html",
                size: "medium",
                result: result, 
                submit: function (value) {
                    editorService.close();
                },
                close: function () {
                    editorService.close();
                }
            });
        };

        $scope.failedTitle = function() {
            let title = 'Failed Test';
            if($scope.results.violations.length !== 1) {
                title += 's';
            }
            if($scope.totalIssues() !== "0") {
                title += ` due to ${$scope.totalIssues()} Error`;
                if($scope.totalIssues() !== 1) {
                    title += 's';
                }
            }
            return title;
        };

        $scope.incompleteTitle = function() {
            let title = 'Incomplete Test';
            if($scope.results.violations.length !== 1) {
                title += 's';
            }
            if($scope.totalIncomplete() !== "0") {
                title += ` due to ${$scope.totalIncomplete()} Error`;
                if($scope.totalIncomplete() !== 1) {
                    title += 's';
                }
            }
            return title;
        };

        function formattedResultsForExport(results) {
            let formattedRows = [];
            for (let index = 0; index < results.length; index++) {
                const currentResult = results[index];
                formattedRows.push({
                    impact: currentResult.impact ? AccessibilityReporterService.upperCaseFirstLetter(currentResult.impact) : '',
                    title: currentResult.help,
                    description: currentResult.description,
                    standard: AccessibilityReporterService.mapTagsToStandard(currentResult.tags).join(', '),
                    errors: currentResult.nodes.length
                });
            }
            return formattedRows;
        }

        function formatFileName(name) {
            return name.replace(/\s+/g, '-').toLowerCase();
        }

        $scope.exportResults = function() {

            try {

                const failedRows = formattedResultsForExport($scope.results.violations);
                const incompleteRows = formattedResultsForExport($scope.results.incomplete);
                const passedRows = formattedResultsForExport($scope.results.passes);

                const failedWorksheet = XLSX.utils.json_to_sheet(failedRows);
                const incompleteWorksheet = XLSX.utils.json_to_sheet(incompleteRows);
                const passedWorksheet = XLSX.utils.json_to_sheet(passedRows);
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, failedWorksheet, "Failed Tests");
                XLSX.utils.book_append_sheet(workbook, incompleteWorksheet, "Incomplete Tests");
                XLSX.utils.book_append_sheet(workbook, passedWorksheet, "Passed Tests");

                const headers = [["Impact", "Title", "Description", "Standard", "Errors"]];
                const passedHeaders = [["Impact", "Title", "Description", "Standard", "Elements"]];
                XLSX.utils.sheet_add_aoa(failedWorksheet, headers, { origin: "A1" });
                XLSX.utils.sheet_add_aoa(incompleteWorksheet, headers, { origin: "A1" });
                XLSX.utils.sheet_add_aoa(passedWorksheet, passedHeaders, { origin: "A1" });

                const failedTitleWidth = failedRows.reduce((w, r) => Math.max(w, r.title.length), 40);
                const incompleteTitleWidth = incompleteRows.reduce((w, r) => Math.max(w, r.title.length), 40);
                const passedTitleWidth = passedRows.reduce((w, r) => Math.max(w, r.title.length), 40);
                failedWorksheet["!cols"] = [{ width: 10 }, { width: failedTitleWidth }, { width: 40 }, { width: 25 }, { width: 8 }  ]; 
                incompleteWorksheet["!cols"] = [{ width: 10 }, { width: incompleteTitleWidth }, { width: 40 }, { width: 25 }, { width: 8 }  ]; 
                passedWorksheet["!cols"] = [{ width: 10 }, { width: passedTitleWidth }, { width: 40 }, { width: 25 }, { width: 8 }  ]; 

                XLSX.writeFile(workbook, 
                    formatFileName(`accessibility-report-${$scope.pageName}-${moment($scope.results.timestamp)
                        .format("DD-MM-YYYY")}`) + ".xlsx", { compression: true });

            } catch(error) {
                notificationsService.error("Failed", "An error occurred exporting the report. Please try again later.");
            }

        };

        init();

    });