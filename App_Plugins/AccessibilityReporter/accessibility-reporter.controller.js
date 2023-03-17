angular
  .module("umbraco")
  .controller(
    "My.AccessibilityReporterApp",
    function (
      $scope,
      editorState,
      appState,
      userService,
      contentResource,
      AccessibilityReporterApiService,
      editorService
    ) {
      $scope.config = {};
      $scope.testUrl = "";
      $scope.pageState = "loading";
      $scope.testPathname = "";
      $scope.violationsOpen = true;
      $scope.incompleteOpen = true;
      $scope.passesOpen = false;
      $scope.userLocale;
      var impacts = ["minor", "moderate", "serious", "critical"];

      function isAbsoluteURL(urlString) {
        return (
          urlString.indexOf("http://") === 0 ||
          urlString.indexOf("https://") === 0
        );
      }

      function getHostnameFromString(url) {
        return new URL(url).hostname;
      }

      function getHostname(possibleUrls) {
        for (var i = 0; i < possibleUrls.length; i++) {
          var possibleCurrentUrl = possibleUrls[i].text;
          if (isAbsoluteURL(possibleCurrentUrl)) {
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
        if (a.impact === b.impact) {
          return b.nodes.length - a.nodes.length;
        }
        if (impacts.indexOf(a.impact) > impacts.indexOf(b.impact)) {
          return -1;
        }
        if (impacts.indexOf(a.impact) < impacts.indexOf(b.impact)) {
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

          if($scope.config.runTestsAutomatically) {
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

      $scope.runTests = function() {
        $scope.pageState = "loading";
        return AccessibilityReporterApiService.getIssues(
          $scope.config,
          $scope.testPathname,
          $scope.userLocale
        )
        .then(function (response) {
          if (response) {
            $scope.results = sortResponse(response);
            $scope.model.badge = {
              count: $scope.totalIssues(),
              type: "alert",
            };
            $scope.testDateTime = moment(response.timestamp).format(
              "MMMM Do YYYY HH:mm:ss"
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

      $scope.totalIssues = function () {
        if (!$scope.results) {
          return 0;
        }

        var total = 0;

        for (var i = 0; i < $scope.results.violations.length; i++) {
          total += $scope.results.violations[i].nodes.length;
        }

        return total.toString();
      };

      $scope.totalPassed = function () {
        if (!$scope.results) {
          return 0;
        }
        return $scope.results.passes.length.toString();
      };

      $scope.totalIncomplete = function () {
        if (!$scope.results) {
          return 0;
        }
        return $scope.results.incomplete.length.toString();
      };

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

      $scope.toggleViolations = function () {
        $scope.violationsOpen = !$scope.violationsOpen;
      };

      $scope.togglePasses = function () {
        $scope.passesOpen = !$scope.passesOpen;
      };

      $scope.toggleIncomplete = function () {
        $scope.incompleteOpen = !$scope.incompleteOpen;
      };

      $scope.openDetail = function (result) {
        editorService.open({
          view: "/App_Plugins/AccessibilityReporter/accessibility-reporter-detail.html",
          size: "medium",
          result: result,
          submit: function (value) {
            editorService.close();
          },
          close: function () {
            editorService.close();
          },
        });
      };

      // https://www.deque.com/axe/core-documentation/api-documentation/
      $scope.mapTagsToStandard = function (tags) {
        var catTagsRemoved = tags.filter((tag) => {
          return tag.indexOf("cat.") === -1;
        });
        var formattedTags = catTagsRemoved.map(tagToStandard);
        return formattedTags;
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
        if (tag.indexOf("wcag") !== -1) {
          return tag.toUpperCase();
        }
        if (tag.indexOf("section") !== -1) {
          return tag.replace("section", "Section ");
        }
        return tag;
      }
    }
  );
