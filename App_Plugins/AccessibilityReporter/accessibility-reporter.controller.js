angular.module("umbraco")
    .controller("My.AccessibilityReporterApp", function ($scope, editorState, AccessibilityReporterApiService, editorService) {

        $scope.pageState = "loading";
        $scope.testUrl = getCurrentLivePageURL(editorState.current.urls); // can also use contentResource.getNiceUrl
        $scope.violationsOpen = true;
        $scope.passesOpen = false;
        $scope.inapplicableOpen = false;
        $scope.incompleteOpen = false;
        var impacts = ["minor","moderate","serious","critical"];

        function isAbsoluteURL(urlString) {
            return urlString.indexOf('http://') === 0 || urlString.indexOf('https://') === 0;
        }

        function getCurrentLivePageURL(possibleUrls) {
            for(var i=0; i < possibleUrls.length; i++){
                var possibleCurrentUrl = possibleUrls[i].text;

                if(isAbsoluteURL(possibleCurrentUrl)) {
                    return possibleCurrentUrl;
                }
            }

            // fallback if hostnames not set assume current host
            return location.protocol + '//' + location.host + possibleUrls[0].text;
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
        AccessibilityReporterApiService.getIssues($scope.testUrl) // $scope.testUrl
        .then(function (response) {
            if (response) {
                $scope.results = sortResponse(response);
                $scope.model.badge = {
                    count: $scope.totalIssues(),
                    type: "alert" 
                };
                $scope.testDateTime = moment(response.timestamp).format('MMMM Do YYYY, h:mm:ss a');
            }
            $scope.pageState = "loaded";
        },
        function (err) {
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

        $scope.totalInapplicable = function() {
            if(!$scope.results) {
                return 0;
            }
            return $scope.results.inapplicable.length.toString();
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

        $scope.toggleInapplicable = function() {
            $scope.inapplicableOpen  = !$scope.inapplicableOpen;
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

    });