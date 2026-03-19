using AccessibilityReporter.Core.Models;
using AccessibilityReporter.Services.Models;

namespace AccessibilityReporter.Services.Interfaces
{
    public interface ITestRunService
    {
        TestRunCreationResult Create(Guid contentId, string culture, string contentHash, string resultPayload);

        IEnumerable<TestRun> Runs(Guid contentId, string culture);
    }
}
