angular
  .module("umbraco")
  .controller("My.AccessibilityReporterDetail", function ($scope) {
    $scope.impactToTag = function (impact) {
      switch (impact) {
        case "serious":
        case "critical":
          return "danger";
        case "moderate":
          return "warning";
        default:
          return "default";
      }
    };

    $scope.addFullStop = function (sentence) {
      return sentence.replace(/([^.])$/, "$1.");
    };

    $scope.formatFailureSummary = function (summary) {
      return $scope.addFullStop(
        summary
          .replace("Fix any of the following:", "")
          .replace("Fix all of the following:", "")
      );
    };
  });
