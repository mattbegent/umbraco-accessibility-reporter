using AccessibilityReporter.Core.Interfaces.Data;

namespace AccessibilityReporter.Core.Interfaces.Repositories
{
    public interface ITestRunRepository
    {
        IEnumerable<ITestRunData> Runs(Guid contentId, string culture);

        ITestRunData? Run(Guid contentId, string culture, string contentHash);

        void Create(ITestRunData testRunData);
    }
}
