using AccessibilityReporter.Core.Models;

namespace AccessibilityReporter.Services.Interfaces
{
    public interface ITestRunService
    {
        void Create(Guid contentId, string resultPayload);

        IEnumerable<TestRun> Runs(Guid contentId);
    }
}
