using AccessibilityReporter.Core.Interfaces.Data;
using AccessibilityReporter.Core.Models;

namespace AccessibilityReporter.Services.Interfaces
{
    internal interface ITestRunMapperService
    {
        public int ApplicableVersion { get; }

        TestRun Map(ITestRunData testRunData);
    }
}
