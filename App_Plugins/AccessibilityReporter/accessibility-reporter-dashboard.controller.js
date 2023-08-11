angular.module("umbraco")
	.controller("My.AccessibilityReporterDashboard", function ($scope, appState, contentResource, editorService, AccessibilityReporterService, AccessibilityReporterApiService, userService) {

        const dashboardStorageKey = "AR.Dashboard";

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
                    loadDashboard();
                })
                .catch(handleError);
        }

        function handleError(error) {
            console.error(error);
            $scope.pageState = "errored";
        }

        function loadDashboard() {
            
            var dashboardResultsFromStorage = AccessibilityReporterService.getItemFromSessionStorage(dashboardStorageKey);
            if(dashboardResultsFromStorage) {
                $scope.results = dashboardResultsFromStorage;
                setStats(dashboardResultsFromStorage);
                $scope.pageState = "has-results";
            }

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

            var startTime = new Date();

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
           
            $scope.results = {
                startTime: startTime,
                endTime: new Date(),
                pages: testResults
            };
            AccessibilityReporterService.saveToSessionStorage(dashboardStorageKey, $scope.results);
            setStats($scope.results);
            $scope.pageState = "has-results";

            $scope.$apply();
        };

        $scope.formatTime = function(dateToFormat) {
            return moment(dateToFormat).format(
                "HH:mm:ss"
            );
        }

        function setStats(testResults) {
            let totalErrors = 0;
            let allErrors = [];

            let totalViolations = 0;
            let totalAViolations = 0;
            let totalAAViolations = 0;
            let totalAAAViolations = 0;
            let totalOtherViolations = 0;

            let pageSummary = [];
            for (let index = 0; index < testResults.pages.length; index++) {
                const currentResult = testResults.pages[index];
                totalErrors += currentResult.violations.length;
                allErrors = allErrors.concat(currentResult.violations);
                if(currentResult.violations.length) {
                    
                    pageSummary.push({
                        url: currentResult.url,
                        name: currentResult.page.name,
                        id: currentResult.page.id,
                        numberOfErrors: currentResult.violations.length
                    });

                    for (let indexVoilations = 0; indexVoilations < currentResult.violations.length; indexVoilations++) {
                        const currentViolation = currentResult.violations[indexVoilations];
                        const violationWCAGLevel = getWCAGLevel(currentViolation.tags);
                        switch (violationWCAGLevel) {
                            case 'AAA':
                                totalAAAViolations += currentViolation.nodes.length;
                                break;
                            case 'AA':
                                totalAAViolations += currentViolation.nodes.length;
                                break;
                            case 'A':
                                totalAViolations += currentViolation.nodes.length;
                                break;
                            case 'Other':
                                totalOtherViolations += currentViolation.nodes.length;
                                break;
                        }
                        totalViolations += currentViolation.nodes.length;
                    }
                }
                
            }

            $scope.pagesTested = testResults.pages.length;
            $scope.totalErrors = totalErrors;

            $scope.totalViolations = totalViolations;
            $scope.totalAAAViolations = totalAAAViolations;
            $scope.totalAAViolations = totalAAViolations;
            $scope.totalAViolations = totalAViolations;
            $scope.totalOtherViolations = totalOtherViolations;
            $scope.reportSummaryText = getReportSummaryText();

            $scope.errorsPerPage = (totalViolations / testResults.pages.length).toFixed(2);
            const sortedAllErrors = allErrors.sort(AccessibilityReporterService.sortIssues);
            $scope.mostCommonErrors = getUniqueErrors(sortedAllErrors).slice(0, 6);
       
            $scope.pageSummary = pageSummary.sort(soryPageSummary);

            $scope.pageWithMostViolations = $scope.pageSummary[0].name;
            $scope.pageWithMostViolationsNumber = $scope.pageSummary[0].numberOfErrors;

            displaySeverityChart(sortedAllErrors);
            topViolationsChart();

            paginateResults();
           
        }

        function getWCAGLevel(tags) {
            for (let index = 0; index < tags.length; index++) {
                const tag = tags[index];
                switch (tag) {
                    case 'wcagaaa':
                        return 'AAA';
                    case 'wcag2aa':
                    case 'wcag21aa':
                    case 'wcag22aa':
                        return 'AA';
                    case 'wcag2a':
                    case 'wcag21a':
                    case 'wcag22a':
                        return 'A';
                    default:
                        continue;
                }
            }
            return 'Other';
        }

        function getReportSummaryText() {
            if($scope.totalAViolations !== 0 && $scope.totalAAViolations !== 0) {
                return `This website <strong>does not</strong> comply with <strong>WCAG AA</strong>.`;
            } 
            return "High 5, you rock! No WCAG A or WCAG AA violations were found. Please manually test your website to check full compliance.";
        }

        function displaySeverityChart(sortedAllErrors) {

            function countNumberOfTestsWithImpact(errors, impact) {
                var totalViolationsForForImpact = 0;
                for (let index = 0; index < errors.length; index++) {
                    const currentError = errors[index];
                    if(currentError.impact === impact) {
                        totalViolationsForForImpact += currentError.nodes.length;
                    }
                }
                return totalViolationsForForImpact;
            }

            $scope.severityChartData = JSON.stringify({
                labels: [
                    'Critical',
                    'Serious',
                    'Moderate',
                    'Minor'
                ],
                datasets: [{
                    label: 'Violations',
                    data: [
                        countNumberOfTestsWithImpact(sortedAllErrors, 'critical'), 
                        countNumberOfTestsWithImpact(sortedAllErrors, 'serious'), 
                        countNumberOfTestsWithImpact(sortedAllErrors, 'moderate'), 
                        countNumberOfTestsWithImpact(sortedAllErrors, 'minor')
                    ],
                    backgroundColor: [
                        'rgb(153,23,61)',
                        'rgb(212, 32, 84)',
                        'rgb(250, 214, 52)',
                        'rgb(27, 38, 79)'
                    ],
                    hoverOffset: 4,
                    rotation: 0
                }]
            });
        }

        function topViolationsChart() {
            $scope.topViolationsChartData = JSON.stringify({
                labels: $scope.mostCommonErrors.map((error)=> error.id.replaceAll('-', ' ').replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase())),
                datasets: [{
                    label: 'Violations',
                    data: $scope.mostCommonErrors.map((error)=> error.nodes.length),
                    backgroundColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(255, 159, 64, 1)',
                        'rgba(255, 205, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(201, 203, 207, 1)'
                    ]
                }]
            });
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