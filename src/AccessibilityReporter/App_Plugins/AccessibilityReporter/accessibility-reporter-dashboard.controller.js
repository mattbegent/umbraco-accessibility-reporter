angular.module("umbraco")
	.controller("My.AccessibilityReporterDashboard", function ($scope, editorService, AccessibilityReporterService, AccessibilityReporterApiService, userService, notificationsService) {

        const dashboardStorageKey = "AR.Dashboard";

        $scope.pageState = "pre-test";
        $scope.accessibilityReporterService = AccessibilityReporterService;
        $scope.pageSize = 5;
        $scope.currentPage = 1;
        $scope.currentTestUrl = "";

        $scope.results = [];
        $scope.pagesTestResults = [];
        $scope.totalErrors = null;
        $scope.averagePageScore = null;
        $scope.pageWithLowestScore = null;
        $scope.numberOfPagesTested = null;
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

            const dashboardResultsFromStorage = AccessibilityReporterService.getItemFromLocalStorage(dashboardStorageKey);
            if(dashboardResultsFromStorage) {
                $scope.results = dashboardResultsFromStorage;
                setStats(dashboardResultsFromStorage);
                $scope.pageState = "has-results";
                if(moment($scope.results.endTime).isBefore(moment().subtract(7, 'days'))) {
                    notificationsService.warning("Outdated Results", "The results shown are older than 7 days. Please run a new test to get the latest results.");
                }
            }

        }

        async function getTestUrls() {
            const pages = await AccessibilityReporterApiService.getPages();
            $scope.testPages = pages;
            return pages;
        }

        async function runSingleTest(page) {

            const testRun = new Promise(async (resolve, reject) => {

                try {
                    $scope.currentTestUrl = page.url;
                    $scope.$apply();
                    const currentResult = await getTestResult(page.url);
                    let resultFormatted = reduceTestResult(currentResult);
                    resultFormatted.score = AccessibilityReporterService.getPageScore(resultFormatted);
                    resultFormatted.page = page;
                    resolve(resultFormatted);
                } catch (error) {
                    reject(error);
                }
            });

            const testTimeout = $scope.config.apiUrl ? 30000 : 10000;
            const timer = new Promise((resolve, reject) => setTimeout(() => reject("Test run exceeded timeout"), testTimeout));

            return await Promise.race([testRun, timer]);
        }

        $scope.runTests = async function() {

            $scope.pageState = "running-tests";
            $scope.results = [];
            $scope.currentTestUrl = "";
            $scope.currentTestNumber = null;
            $scope.pagesTestResults = [];
            $scope.testPages = [];

            const startTime = new Date();

            try {
                await getTestUrls();
            } catch(error) {
                console.error(error);
                return;
            }

            var testResults = [];
            for (let index = 0; index < $scope.testPages.length; index++) {
                const currentPage = $scope.testPages[index];
                try {
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
            AccessibilityReporterService.saveToLocalStorage(dashboardStorageKey, $scope.results);
            setStats($scope.results);
            $scope.pageState = "has-results";

            $scope.$apply();
        };

        $scope.formatTime = function(dateToFormat) {
            return moment(dateToFormat).format(
                "HH:mm:ss DD/MM/YY"
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

            let pagesTestResults = [];
            for (let index = 0; index < testResults.pages.length; index++) {
                const currentResult = testResults.pages[index];
                totalErrors += currentResult.violations.length;
                allErrors = allErrors.concat(currentResult.violations);

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

                pagesTestResults.push({
                    id: currentResult.page.id,
                    name: currentResult.page.name,
                    url: currentResult.page.url,
                    score: currentResult.score,
                    violations: totalViolationsForPage
                });
            }

            $scope.numberOfPagesTested = testResults.pages.length;
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

            $scope.pagesTestResults = pagesTestResults.sort(sortPageTestResults);

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

        function getHighestLevelOfNonCompliance() {
            if($scope.totalAAAViolations !== 0) {
                return 'AAA';
            }
            if($scope.totalAAViolations !== 0) {
                return'AA';
            }
            if($scope.totalAViolations !== 0) {
                return 'A';
            }
            return null;
        }

        function getReportSummaryText() {
            const highestLevelOfNonCompliance = getHighestLevelOfNonCompliance();
            if(highestLevelOfNonCompliance) {
                return `This website <strong>does not</strong> comply with <strong>WCAG ${highestLevelOfNonCompliance}</strong>.`;
            }
            if($scope.totalOtherViolations !== 0) {
                return "High 5, you rock! No WCAG violations were found. However, some other issues were found. Please manually test your website to check full compliance.";
            }
            return "High 5, you rock! No WCAG violations were found. Please manually test your website to check full compliance.";
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
                        'rgb(120,0,0)',
                        'rgb(212, 32, 84)',
                        'rgb(250, 214, 52)',
                        'rgb(49, 68, 142)'
                    ],
                    hoverOffset: 4,
                    rotation: 0
                }],
                patterns: [
                    '',
                    'diagonal',
                    'zigzag-horizontal',
                    'dot'
                ]
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
                    impact: violation.impact,
                    tags: violation.tags,
                    title: violation.help,
                    description: violation.description,
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

        function sortPageTestResults(a, b) {
            if (a.score === b.score) {
                return b.violations - a.violations;
            }
            if (a.score < b.score) {
                return -1;
            }
            if (a.score > b.score) {
                return 1;
            }
            return 0;
        }

        $scope.showViolationsForLevel = function(level) {
            for (let index = 0; index < $scope.config.testsToRun.length; index++) {
                const currentLevel = $scope.config.testsToRun[index];
                if(currentLevel.endsWith(`2${level}`) ||
                currentLevel.endsWith(`21${level}`) ||
                currentLevel.endsWith(`22${level}`)) {
                    return true;
                }
            }
            return false;;
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
            $scope.pagination = paginate($scope.pagesTestResults.length, $scope.currentPage, $scope.pageSize, 99);
            $scope.pagesTestResultsCurrentPage = getDataForPagination($scope.pagesTestResults, $scope.pageSize, $scope.currentPage);
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

        $scope.exportResults = function() {

            try {

                const workbook = XLSX.utils.book_new();

                const pagesRows = $scope.pagesTestResults.map(page => ({
                    name: page.name,
                    url: page.url,
                    score: page.score,
                    violations: page.violations
                }));

                const pagesWorksheet = XLSX.utils.json_to_sheet(pagesRows);
                XLSX.utils.book_append_sheet(workbook, pagesWorksheet, "Pages Summary");

                const pagesHeaders = [["Name", "URL", "Accessibility Score", "Total Violations"]];
                XLSX.utils.sheet_add_aoa(pagesWorksheet, pagesHeaders, { origin: "A1" });

                pagesWorksheet["!cols"] = [
                    { width: 30 }, // Name
                    { width: 40 }, // URL
                    { width: 20 }, // Score
                    { width: 15 }  // Violations
                ];


                let allViolations = [];

                $scope.results.pages.forEach(pageResult => {
                    const pageName = pageResult.page.name;
                    const pageUrl = pageResult.page.url;

                    pageResult.violations.forEach(violation => {
                        allViolations.push({
                            pageName: pageName,
                            pageUrl: pageUrl,
                            impact: violation.impact ? AccessibilityReporterService.upperCaseFirstLetter(violation.impact) : '',
                            title: violation.title || '',
                            description: violation.description || '',
                            standard: AccessibilityReporterService.mapTagsToStandard(violation.tags).join(', '),
                            nodeCount: violation.nodes ? violation.nodes.length : 0
                        });
                    });
                });

                if (allViolations.length > 0) {
                    const violationsWorksheet = XLSX.utils.json_to_sheet(allViolations);
                    XLSX.utils.book_append_sheet(workbook, violationsWorksheet, "All Violations");

                    const violationsHeaders = [["Name", "URL", "Impact", "Title", "Description", "Accessibility Standard", "Instances"]];
                    XLSX.utils.sheet_add_aoa(violationsWorksheet, violationsHeaders, { origin: "A1" });

                    const titleWidth = allViolations.reduce((w, r) => Math.max(w, r.title ? r.title.length : 0), 40);
                    violationsWorksheet["!cols"] = [
                        { width: 25 }, // Name
                        { width: 40 }, // URL
                        { width: 10 }, // Impact
                        { width: titleWidth }, // Title
                        { width: 50 }, // Description
                        { width: 25 }, // Standard
                        { width: 10 }  // Count
                    ];
                }

                XLSX.writeFile(
                    workbook,
                    AccessibilityReporterService.formatFileName(
                        `website-accessibility-report-${moment($scope.results.endTime).format("DD-MM-YYYY")}`
                    ) + ".xlsx",
                    { compression: true }
                );

            } catch(error) {
                console.error(error);
                notificationsService.error("Failed", "An error occurred exporting the report. Please try again later.");
            }

        };

        init();

    });
