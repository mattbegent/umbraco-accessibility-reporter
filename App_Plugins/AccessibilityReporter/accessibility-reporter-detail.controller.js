angular.module("umbraco")
    .controller("My.AccessibilityReporterDetail", function ($scope) {

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

    });