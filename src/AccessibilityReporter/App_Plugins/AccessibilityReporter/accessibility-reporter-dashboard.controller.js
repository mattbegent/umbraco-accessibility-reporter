angular.module("umbraco")
	.controller("My.AccessibilityReporterDashboard", function ($scope, editorService, AccessibilityReporterService, AccessibilityReporterApiService, userService) {

        const dashboardStorageKey = "AR.Dashboard";
        let preloadedUrls = new Set();

        $scope.pageState = "pre-test";
        $scope.accessibilityReporterService = AccessibilityReporterService;
        $scope.pageSize = 5;
        $scope.currentPage = 1;
        $scope.currentTestUrl = "";

        $scope.results = [];
        $scope.pagesWithViolations = [];
        $scope.totalErrors = null;
        $scope.averagePageScore = null;
        $scope.pageWithLowestScore = null;
        $scope.pagesTested = null;
        $scope.mostCommonErrors = null;
        $scope.currentTestNumber = null;
        $scope.testPages = [];

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

            const dashboardResultsFromStorage = AccessibilityReporterService.getItemFromSessionStorage(dashboardStorageKey);
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

        async function runSingleTest(page) {

            return new Promise(async (resolve, reject) => {

                try {
                    $scope.currentTestUrl = page.url;
                    $scope.$apply();
                    const currentResult = await getTestResult(page.url);
                    const resultFormatted = reduceTestResult(currentResult);
                    resultFormatted.score = AccessibilityReporterService.getPageScore(resultFormatted);

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
            $scope.currentTestNumber = null;
            $scope.pagesWithViolations = [];
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
                const nextPage = (index + 1 <= $scope.testPages.length) ? $scope.testPages[index + 1] : null;
                try {
                    if(nextPage) {
                        preload(nextPage.url);
                    }
                    $scope.currentTestNumber = index + 1;
                    const result = await runSingleTest(currentPage);
                    testResults.push(result);
                    if($scope.pageState !== "running-tests") {
                        break;
                    }
                } catch(error) {
                    console.error(error);
                    continue;
                }
            }


            if($scope.pageState !== "running-tests") {
                return;
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

            let pagesWithViolations = [];
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

                    pagesWithViolations.push({
                        url: currentResult.page.url,
                        name: currentResult.page.name,
                        id: currentResult.page.id,
                        numberOfErrors: totalViolationsForPage,
                        score: currentResult.score
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

            $scope.averagePageScore = getAveragePageScore(testResults.pages);
            $scope.pageWithLowestScore = getPageWithLowestScore(testResults.pages);

            const sortedByImpact = allErrors.sort(AccessibilityReporterService.sortIssuesByImpact);
            $scope.mostCommonErrors = getErrorsSortedByViolations(allErrors).slice(0, 6);

            $scope.pagesWithViolations = pagesWithViolations.sort(sortPagesWithViolations);

            displaySeverityChart(sortedByImpact);
            topViolationsChart();

            paginateResults();

        }

        function getAveragePageScore(results) {
            let totalScore = 0;
            for (let index = 0; index < results.length; index++) {
                const result = results[index];
                totalScore += result.score;
            }
            return Math.round(totalScore/results.length);
        }

        function getPageWithLowestScore(results) {
            let lowestScore = 0;
            let pageWithLowestScore = null;
            for (let index = 0; index < results.length; index++) {
                const result = results[index];
                if(!pageWithLowestScore) {
                    lowestScore = result.score;
                    pageWithLowestScore = result;
                    continue;
                }
                if(result.score < lowestScore) {
                    lowestScore = result.score;
                    pageWithLowestScore = result;
                }
            }

            return pageWithLowestScore;
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
                    data: $scope.mostCommonErrors.map((error)=> error.errors),
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
            return $scope.config.apiUrl ? AccessibilityReporterApiService.getIssues($scope.config, testUrl, $scope.userLocale) : $scope.accessibilityReporterService.runTest(testUrl, true);
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

        function getErrorsSortedByViolations(errors) {

            let allErrors = [];
            for (let index = 0; index < errors.length; index++) {
                const currentError = errors[index];
                if(!allErrors.some((error)=> error.id === currentError.id)) {
                    allErrors.push({
                        id: currentError.id,
                        errors: currentError.nodes.length
                    });
                } else {
                    const errorIndex = allErrors.findIndex((error => error.id == currentError.id));
                    allErrors[errorIndex].errors += currentError.nodes.length;
                }
            }

            const sortedAllErrors = allErrors.sort((a, b)=> b.errors - a.errors);
            return sortedAllErrors;
        }

        function sortPagesWithViolations(a, b) {
            if (a.score === b.score) {
                return b.numberOfErrors - a.numberOfErrors;
            }
            if (a.score < b.score) {
                return -1;
            }
            if (a.score > b.score) {
                return 1;
            }
            return 0;
        }

        $scope.openDetail = function(id) {

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

        $scope.stopTests = function() {
            $scope.pageState = "pre-test";
        }

        function getDataForPagination(array, page_size, page_number) {
            return array.slice((page_number - 1) * page_size, page_number * page_size);
        }

        function paginateResults() {
            $scope.pagination = paginate($scope.pagesWithViolations.length, $scope.currentPage, $scope.pageSize, 99);
            $scope.pagesWithViolationsCurrentPage = getDataForPagination($scope.pagesWithViolations, $scope.pageSize, $scope.currentPage);
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

        function preload(url) {
            if(preloadedUrls.has(url)) {
                return;
            }
            const linkElement = document.createElement('link');
            linkElement.rel = 'prefetch';
            linkElement.href = url;
            linkElement.fetchPriority = 'high';
            linkElement.as = 'document';
            document.head.appendChild(linkElement);
            preloadedUrls.add(url);
        }

        init();

    });
