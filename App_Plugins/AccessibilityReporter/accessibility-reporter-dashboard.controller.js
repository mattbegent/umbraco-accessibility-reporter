angular.module("umbraco")
	.controller("My.AccessibilityReporterDashboard", function ($scope, appState, contentResource, editorService, AccessibilityReporterService, AccessibilityReporterApiService, userService) {

        $scope.pageState = "pre-test";
        $scope.results = [];
        $scope.pageSummary = [];
        $scope.totalErrors = null;
        $scope.errorsPerPage = null;
        $scope.pagesTested = null;
        $scope.mostCommonErrors = null;
        $scope.currentTestUrl = "";
        $scope.testPages = [];
        $scope.accessibilityReporterService = AccessibilityReporterService;
        $scope.pageSize = 5;
        $scope.currentPage = 1;

        function init() {
            AccessibilityReporterApiService.getConfig()
                .then(function (config) {
                    $scope.config = config;
                    if (!config.testBaseUrl) {
                        $scope.config.testBaseUrl = AccessibilityReporterService.getBaseURL();
                    }
                })
                .then(function () {
                    return userService.getCurrentUser();
                })
                .then(function (user) {
                    $scope.userLocale = user && user.locale ? user.locale : undefined;
                })
                .catch(handleError);
        }

        function handleError(error) {
            console.error(error);
            $scope.pageState = "errored";
        }

        // Checkout for getting the url!!!!
        // https://github.com/enkelmedia/Umbraco-SeoVisualizer/blob/v9/SeoVisualizer/App_Plugins/SeoVisualizer/SeoVisualizerController.controller.js

        async function getTestUrls() {
            const rootNode = appState.getTreeState("currentRootNode").root.children[0];
            const url = await contentResource.getNiceUrl(rootNode.id);
            $scope.testPages.push({
              url: AccessibilityReporterService.getBaseURL() + url,
              id: rootNode.id,
              name: rootNode.name
            });
            await getChildren(rootNode.id);
        }

        async function getChildren(nodeId) {
            const children = await contentResource.getChildren(nodeId);

            if(children.items) {
                for (let index = 0; index < children.items.length; index++) {
                    const element = children.items[index];
                    if(element.state === "Published") {
                        console.log(element);
                        const url = await contentResource.getNiceUrl(element.id);
                        //const content = await contentResource.getById(element.id, $scope.userLocale)
                        $scope.testPages.push({
                            url: AccessibilityReporterService.getBaseURL() + url,
                            id: element.id,
                            name: element.name
                        });
                    }
                    const itemChildren = await contentResource.getChildren(element.id);
                    if(itemChildren.items) {
                        await getChildren(element.id);
                    }
                }
                
            }

        }

        $scope.runTests = async function() {

            $scope.pageState = "running-tests";
            $scope.results = [];
            $scope.pageSummary = [];
            $scope.testPages = [];

            try {
                await getTestUrls();
            } catch(error) {
                console.error(error);
                return;
            }

            let testResults = [];
            for (let index = 0; index < $scope.testPages.length; index++) {
                const currentPage = $scope.testPages[index];
                $scope.currentTestUrl = currentPage.url;
                try {
                    const currentResult = await getTestResult(currentPage.url);
                    const testResult = Object.assign({
                        page: currentPage
                    }, currentResult);
    
                    testResults.push(testResult);
                    $scope.$apply();
                } catch(error) {
                    console.error(error);
                    continue;
                }
            }
           
            $scope.results = testResults;
            setStats(testResults);
            $scope.pageState = "has-results";

            $scope.$apply();
        };

        function setStats(testResults) {
            let totalErrors = 0;
            let allErrors = [];
            let pageSummary = [];
            for (let index = 0; index < testResults.length; index++) {
                const currentResult = testResults[index];
                totalErrors += currentResult.violations.length;
                allErrors = allErrors.concat(currentResult.violations);
                if(currentResult.violations.length) {
                    pageSummary.push({
                        url: currentResult.url,
                        name: currentResult.page.name,
                        id: currentResult.page.id,
                        numberOfErrors: currentResult.violations.length
                    });
                }
                
            }
            $scope.pagesTested = testResults.length;
            $scope.totalErrors = totalErrors;
            $scope.errorsPerPage = (totalErrors / testResults.length).toFixed(2);;
            const sortedAllErrors = allErrors.sort(AccessibilityReporterService.sortIssues);
            $scope.mostCommonErrors = getUniqueErrors(sortedAllErrors).slice(0, 6);; 
            $scope.pageSummary = pageSummary.sort(soryPageSummary);

            paginateResults();
           
        }

        async function getTestResult(testUrl) {
            return $scope.config.apiUrl ? AccessibilityReporterApiService.getIssues($scope.config, testUrl, $scope.userLocale) : $scope.accessibilityReporterService.runTest(testUrl);
        }

        function getUniqueErrors(errors) {
            var unique = [];
            var distinct = [];
            for( let i = 0; i < errors.length; i++ ){
                if( !unique[errors[i].id]){
                    distinct.push(errors[i]);
                    unique[errors[i].id] = 1;
                }
                }
                console.log(distinct);
            return distinct;
        }

        function soryPageSummary(a, b) {
            return b.numberOfErrors - a.numberOfErrors;
        }

        $scope.openDetail= function(id) {

            editorService.contentEditor({
                id: id,
                submit: function (model) {
                    editorService.close();
                },
                close: function () {
                    editorService.close();
                }
            });

        }

        function getDataForPagination(array, page_size, page_number) {
            return array.slice((page_number - 1) * page_size, page_number * page_size);
        }

        function paginateResults() {
            $scope.pagination = paginate($scope.pageSummary.length, $scope.currentPage, $scope.pageSize, 99);
            $scope.pageSummaryCurrentPage = getDataForPagination($scope.pageSummary, $scope.pageSize, $scope.currentPage);
        }

        $scope.changePage = function(pageNumber) {
            $scope.currentPage = pageNumber;
            paginateResults();
        }

        function paginate(totalItems, currentPage, pageSize) {
            let totalPages = Math.ceil(totalItems / pageSize);
            if (currentPage < 1) { 
                currentPage = 1; 
            } else if (currentPage > totalPages) { 
                currentPage = totalPages; 
            }
            return {
                currentPage: currentPage,
                totalPages: totalPages
            };
        }

        init();
   
    });