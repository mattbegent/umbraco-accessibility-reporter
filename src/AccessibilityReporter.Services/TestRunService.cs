using AccessibilityReporter.Core.Interfaces.Repositories;
using AccessibilityReporter.Core.Models;
using AccessibilityReporter.Services.Interfaces;
using AccessibilityReporter.Database.Data.Models;

namespace AccessibilityReporter.Services
{
    internal class TestRunService : ITestRunService
    {
        private readonly ITestRunRepository _testRunRepository;
        private readonly Dictionary<int, ITestRunMapperService> _testRunMapperServices;

        // Basic versioning implementation in case we need to change the payload structure in the future, fixed at v1 for now
        private const int PayloadVersion = 1;

        public TestRunService(ITestRunRepository testRunRepository,
            IEnumerable<ITestRunMapperService> testRunMapperServices)
        {
            _testRunRepository = testRunRepository;
            _testRunMapperServices = testRunMapperServices.ToDictionary(mapper => mapper.ApplicableVersion, mapper => mapper);
        }

        public void Create(Guid contentId, string resultPayload)
        {
            var testRunData = new TestRunData
            {
                ContentId = contentId,
                ResultPayload = resultPayload,
                RunCompleted = DateTime.Now,
                ResultPayloadVersion = PayloadVersion
            };

            _testRunRepository.Create(testRunData);
        }

        public IEnumerable<TestRun> Runs(Guid contentId)
        {
            var runs = _testRunRepository.Runs(contentId);

            return runs.Select(run => _testRunMapperServices[run.ResultPayloadVersion].Map(run));
        }
    }
}
