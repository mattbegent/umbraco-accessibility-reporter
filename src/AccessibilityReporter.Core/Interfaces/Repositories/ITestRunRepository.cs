using AccessibilityReporter.Core.Interfaces.Data;

namespace AccessibilityReporter.Core.Interfaces.Repositories
{
    public interface ITestRunRepository
    {
        IEnumerable<ITestRunData> Runs(Guid contentId);

        void Create(ITestRunData testRunData);
    }
}
