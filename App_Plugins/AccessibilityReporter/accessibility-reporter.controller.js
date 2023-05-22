angular.module("umbraco")
	.controller("My.AccessibilityReporterApp", function ($scope, editorState, userService, contentResource, AccessibilityReporterApiService, editorService, appState, notificationsService) {

        $scope.config = {};
        $scope.pageState = "loading";
        $scope.testUrl = "";
        $scope.testPathname = "";
        $scope.violationsOpen = true;
        $scope.incompleteOpen = true;
        $scope.passesOpen = false;
        $scope.userLocale;
        const impacts = ["minor","moderate","serious","critical"];

        function init() {
            AccessibilityReporterApiService.getConfig()
                .then(function (config) {
                    $scope.config = config;
                    if (config.multisiteTestBaseUrls) {
                        var parentName = getParentNodeName();
                        if (parentName) {
                            $scope.config.testBaseUrl = config.multisiteTestBaseUrls.find(
                                (url) => url.name === parentName
                            ).url;
                        } else {
                            $scope.config.testBaseUrl = getFallbackBaseUrl();
                        }
                    }
                    if (!config.testBaseUrl) {
                        $scope.config.testBaseUrl = getFallbackBaseUrl();
                    }
                })
                .then(function () {
                    return contentResource.getNiceUrl(editorState.current.id);
                })
                .then(function (data) {
                    if (isAbsoluteURL(data)) {
                        $scope.testPathname = new URL(data).pathname;
                    } else {
                        $scope.testPathname = data;
                    }
                    return data;
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
                    $scope.testUrl = new URL(
                        $scope.testPathname,
                        $scope.config.testBaseUrl
                    ).toString();

                    if ($scope.config.runTestsAutomatically) {
                        $scope.runTests();
                    } else {
                        $scope.pageState = "manuallyrun";
                    }

                })
                .catch(function () {
                    if ($scope.pageState !== "unauthorised") {
                        $scope.pageState = "errored";
                    }
                });
        }

        function getPageName() {
            return appState.getTreeState("selectedNode") ? appState.getTreeState("selectedNode").name : 'current page';;
        }

        function isAbsoluteURL(urlString) {
            return urlString.indexOf('http://') === 0 || urlString.indexOf('https://') === 0;
        }

        function getHostnameFromString(url) {
            return new URL(url).hostname;
        }

        function getHostname(possibleUrls) {
            for(var i=0; i < possibleUrls.length; i++){
                var possibleCurrentUrl = possibleUrls[i].text; 
                if(isAbsoluteURL(possibleCurrentUrl)) {
                    return getHostnameFromString(possibleCurrentUrl);
                }
            }
            // fallback if hostnames not set assume current host
            return location.hostname;
        }

        function getParentNodeName() {
            var parentName = "";
            function findNode(id, array) {
                for (const node of array) {
                    if (node.level === 1) {
                        parentName = node.name;
                    }
                    if (node.id === id) return node;
                    if (node.children) {
                        const child = findNode(id, node.children);
                        if (child) return parentName;
                    }
                }
            }
            var rootNode = appState.getTreeState("currentRootNode");
            //var selectedNode = appState.getTreeState("selectedNode");
            findNode(editorState.current.id + "", rootNode.root.children);
            return parentName;
        }

        function getFallbackBaseUrl() {
            return location.protocol + "//" + getHostname(editorState.current.urls);
        }
        
        function sortIssues(a, b) {
            if(a.impact === b.impact) {
                return  b.nodes.length - a.nodes.length;
            }
            if(impacts.indexOf(a.impact) > impacts.indexOf(b.impact)) {
                return -1;
            }
            if(impacts.indexOf(a.impact) < impacts.indexOf(b.impact)) {
                return 1;
            }
            return 0;
        }

        function sortResponse(results) {
            
            var sortedViolations = results.violations.sort(sortIssues);
            results.violations = sortedViolations;
            var sortedIncomplete = results.incomplete.sort(sortIssues);
            results.incomplete = sortedIncomplete;
            return results;
        }

        $scope.runTests = function() {
            $scope.pageState = "loading";
            $scope.pageName = getPageName();
            return contentResource.getNiceUrl(editorState.current.id).then(function (data) {
                if (isAbsoluteURL(data)) {
                    $scope.testUrl = data;
                } else {
                    var potentialHostDomain = getHostname(editorState.current.urls);
                    $scope.testUrl = location.protocol + '//' + potentialHostDomain + data;
                }
            }).then(function() {
                return AccessibilityReporterApiService.getIssues($scope.config, $scope.testUrl, $scope.userLocale)
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
              }
              $scope.pageState = "loaded";
            })
            .catch(function () {
                if ($scope.pageState !== "unauthorised") {
                    $scope.pageState = "errored";
                }
            });
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

        $scope.impactToTag = function(impact) {
            switch(impact) {
                case "serious":
                case "critical":
                  return "danger";
                case "moderate":
                    return "warning";
                default:
                  return "default";
            };
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

        // https://www.deque.com/axe/core-documentation/api-documentation/
        $scope.mapTagsToStandard = function(tags) {
            var catTagsRemoved = tags.filter(tag => {
                return tag.indexOf('cat.') === -1 && !tag.startsWith('TT') && !tag.startsWith('ACT');
            });
            var formattedTags = catTagsRemoved.map(tagToStandard);
            return formattedTags;
        }

        $scope.upperCaseFirstLetter = function(word) {
            return word.charAt(0).toUpperCase() + word.slice(1);
        }

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
                    impact: currentResult.impact ? $scope.upperCaseFirstLetter(currentResult.impact) : '',
                    title: currentResult.help,
                    description: currentResult.description,
                    standard: $scope.mapTagsToStandard(currentResult.tags).join(', '),
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

        function tagToStandard(tag) {
            switch (tag) {
                case "wcag2a":
                    return "WCAG 2.0 A";
                case "wcag2aa":
                    return "WCAG 2.0 AAA";
                case "wcag2aaa":
                    return "WCAG 2.0 AAA";
                case "wcag21a":
                    return "WCAG 2.1 A";
                case "wcag21aa":
                    return "WCAG 2.1 AAA";
                case "wcag21aaa":
                    return "WCAG 2.1 AAA";
                case "wcag22a":
                    return "WCAG 2.2 A";
                case "wcag22aa":
                    return "WCAG 2.2 AAA";
                case "wcag22aaa":
                    return "WCAG 2.2 AAA";
                case "best-practice":
                    return "Best Practice";
                case "section508":
                    return "Section 508";
                default:
                    break;
            }
            if(tag.indexOf('wcag') !== -1) {
                return tag.toUpperCase();
            }
            if(tag.indexOf('section') !== -1) {
                return tag.replace('section', 'Section ');
            }
            return tag;
        };

        init();

    });