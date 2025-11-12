using AccessibilityReporter.Core.Interfaces.Data;
using AccessibilityReporter.Core.Models;
using AccessibilityReporter.Services.Interfaces;

namespace AccessibilityReporter.Services
{
    internal class TestRunV1MapperService : ITestRunMapperService
    {
        public int ApplicableVersion => 1;

        public TestRun Map(ITestRunData testRunData)
        {
            return new TestRun
            {
                ContentId = testRunData.ContentId,
                RunCompleted = testRunData.RunCompleted,
                Score = 100
            };
        }
    }
}
