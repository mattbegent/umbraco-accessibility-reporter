angular.module("umbraco")
    .controller("My.AccessibilityReporterDetail", function ($scope, AccessibilityReporterService) {

        $scope.accessibilityReporterService = AccessibilityReporterService;

        $scope.addFullStop = function(sentence) {
            return sentence.replace(/([^.])$/, '$1.');
        };

        $scope.formatFailureSummary = function(summary) {
            return $scope.addFullStop(summary.replace('Fix any of the following:', '').replace('Fix all of the following:', ''));
        };

    });
