using AccessibilityReporter.Core.Interfaces.Data;

namespace AccessibilityReporter.Core.Interfaces.Repositories
{
    public interface ITestRunRepository
    {
        IEnumerable<ITestRunData> Runs(Guid contentId, string culture);

        ITestRunData? Run(Guid contentId, string culture, string contentHash);

        void Create(ITestRunData testRunData);

        /// <summary>
        /// Deletes all test runs completed before the given threshold, as part of the history
        /// retention/cleanup policy.
        /// </summary>
        void DeleteOlderThan(DateTime threshold);

        /// <summary>
        /// Returns the distinct sites (root content nodes) that have at least one test run recorded.
        /// </summary>
        IEnumerable<(Guid RootId, string RootName)> Sites();

        /// <summary>
        /// Returns all test runs recorded for the given site (root content node), optionally filtered
        /// to a single culture, for site-level trend aggregation.
        /// </summary>
        IEnumerable<ITestRunData> RunsForRoot(Guid rootContentId, string? culture);
    }
}
