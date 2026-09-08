using AccessibilityReporter.Core.Interfaces.Repositories;
using AccessibilityReporter.Core.Models;
using AccessibilityReporter.Services.Interfaces;

namespace AccessibilityReporter.Services
{
    internal class SiteHistoryService : ISiteHistoryService
    {
        private readonly ITestRunRepository _testRunRepository;
        private readonly Dictionary<int, ITestRunMapperService> _testRunMapperServices;

        public SiteHistoryService(ITestRunRepository testRunRepository,
            IEnumerable<ITestRunMapperService> testRunMapperServices)
        {
            _testRunRepository = testRunRepository;
            _testRunMapperServices = testRunMapperServices.ToDictionary(mapper => mapper.ApplicableVersion, mapper => mapper);
        }

        public IEnumerable<SiteSummary> Sites()
            => _testRunRepository.Sites().Select(site => new SiteSummary { RootId = site.RootId, RootName = site.RootName });

        public IEnumerable<SiteTrendPoint> Trend(Guid rootContentId, string? culture)
        {
            var runs = _testRunRepository.RunsForRoot(rootContentId, culture)
                .Select(run => _testRunMapperServices[run.ResultPayloadVersion].Map(run));

            // Keep only the latest run per page per day, so re-testing the same page more than once in
            // a day doesn't skew that day's site-wide average.
            var latestPerPagePerDay = runs
                .GroupBy(run => (run.ContentId, Date: run.RunCompleted.Date))
                .Select(group => group.OrderBy(run => run.RunCompleted).Last());

            return latestPerPagePerDay
                .GroupBy(run => run.RunCompleted.Date)
                .OrderBy(group => group.Key)
                .Select(group => new SiteTrendPoint
                {
                    Date = group.Key,
                    AverageScore = (int)Math.Round(group.Average(run => run.Score)),
                    PagesTested = group.Count(),
                    TotalViolations = group.Sum(run => run.FailedCount)
                })
                .ToList();
        }
    }
}
