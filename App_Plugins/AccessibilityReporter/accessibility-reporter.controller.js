angular.module("umbraco")
	.controller("My.AccessibilityReporterApp", function ($scope, editorState, userService, contentResource, AccessibilityReporterApiService, editorService) {

        $scope.pageState = "loading";
        $scope.testUrl = "";
        $scope.violationsOpen = true;
        $scope.incompleteOpen = true;
        $scope.passesOpen = false;
        var impacts = ["minor","moderate","serious","critical"];

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

        // TODO: If a local page we could fall back to grabbing and sending html instead maybe?
        contentResource.getNiceUrl(editorState.current.id).then(function (data) {
            if (isAbsoluteURL(data)) {
                $scope.testUrl = data;
            } else {
                var potentialHostDomain = getHostname(editorState.current.urls);
                $scope.testUrl = location.protocol + '//' + potentialHostDomain + data;
            }
        })
        .then(function() {
            return userService.getCurrentUser();
        })
        .then(function (user) {
            var userLocale = user && user.locale ? user.locale : undefined;
            return AccessibilityReporterApiService.getIssues($scope.testUrl, userLocale);
        })
        .then(function (response) {
            if (response) {
                $scope.results = sortResponse(response);
                $scope.model.badge = {
                    count: $scope.totalIssues(),
                    type: "alert" 
                };
                $scope.testDateTime = moment(response.timestamp).format('MMMM Do YYYY HH:mm:ss');
            }
            $scope.pageState = "loaded";
        },
        function (error) {
            $scope.pageState = "errored";
        });
    
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
            return $scope.results.incomplete.length.toString();
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
                return tag.indexOf('cat.') === -1;
            });
            var formattedTags = catTagsRemoved.map(tagToStandard);
            return formattedTags;
        }

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
        }

    });