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

        async function getTestUrls() {

            const pages = await AccessibilityReporterApiService.getPages();
            $scope.testPages = pages;

            return pages;
        }


        async function promiseAllInBatches(task, items, batchSize) {
            let position = 0;
            let results = [];
            while (position < items.length) {
                const itemsForBatch = items.slice(position, position + batchSize);
                const settledPromises = await Promise.allSettled(itemsForBatch.map(item => task(item)));
                const newResults = settledPromises.filter(result=> result.status === "fulfilled").map(result => result.value);
                results = [...results, ...newResults];
                position += batchSize;
            }
            return results;
        }

        async function runSingleTest(page) {

            return new Promise(async (resolve, reject) => {

                try {
                    const currentResult = await getTestResult(page.url);  
                    $scope.currentTestUrl = page.url;   
                    const resultFormatted = reduceTestResult(currentResult);
                    
                    const testResult = Object.assign({
                        page: page
                    }, resultFormatted);

                    resolve(testResult);

                } catch (error) {
                    reject(error); 
                }
            });
        }

        $scope.runTests = async function() {

            $scope.pageState = "running-tests";
            $scope.results = [];
            $scope.currentTestUrl = "";
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

            try {
                const results = await promiseAllInBatches(runSingleTest, $scope.testPages, 5);
                testResults = results;
            } catch(error) {
                console.error(error);
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
                if (currentResult.violations.length) {
                    
                    let totalViolationsForPage = 0;

                    for (let indexVoilations = 0; indexVoilations < currentResult.violations.length; indexVoilations++) {
                        const currentViolation = currentResult.violations[indexVoilations];
                        const violationWCAGLevel = AccessibilityReporterService.getWCAGLevel(currentViolation.tags);
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
                        totalViolationsForPage += currentViolation.nodes.length;
                    }

                    pageSummary.push({
                        url: currentResult.page.url,
                        name: currentResult.page.name,
                        id: currentResult.page.id,
                        numberOfErrors: totalViolationsForPage
                    });
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
            const sortedByImpact = allErrors.sort(AccessibilityReporterService.sortIssuesByImpact);
            const sortedByViolations = allErrors.sort(AccessibilityReporterService.sortByViolations);
            $scope.mostCommonErrors = getUniqueErrors(sortedByViolations).slice(0, 6);
       
            $scope.pageSummary = pageSummary.sort(soryPageSummary);

            $scope.pageWithMostViolations = $scope.pageSummary[0].name;
            $scope.pageWithMostViolationsNumber = $scope.pageSummary[0].numberOfErrors;

            displaySeverityChart(sortedByImpact);
            topViolationsChart();

            paginateResults();
           
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

        function reduceTestResult(testResult) {
            const { inapplicable, incomplete, passes, testEngine, testEnvironment, testRunner, toolOptions, url, timestamp, ...resultFormatted } = testResult;
                    
            resultFormatted.violations = resultFormatted.violations.map((violation)=> {
                return {
                    id: violation.id,
                    help: violation.help,
                    impact: violation.impact,
                    tags: violation.tags,
                    nodes: violation.nodes.map((node)=> {
                        return {
                            impact: node.impact
                        }
                    })
                }

            });

            return resultFormatted;
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
