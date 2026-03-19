using AccessibilityReporter.Core.Interfaces.Repositories;
using AccessibilityReporter.Core.Models;
using AccessibilityReporter.Database.Data.Models;
using AccessibilityReporter.Services.Interfaces;
using AccessibilityReporter.Services.Models;

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

        public TestRunCreationResult Create(Guid contentId, string culture, string contentHash, string resultPayload)
        {
            var testRunData = new TestRunData
            {
                ContentId = contentId,
                Culture = culture,
                ContentHash = contentHash,
                ResultPayload = resultPayload,
                RunCompleted = DateTime.Now,
                ResultPayloadVersion = PayloadVersion
            };

            if (_testRunRepository.Run(contentId, culture, contentHash) != null)
                            {
                return TestRunCreationResult.Ignored;
            }

            _testRunRepository.Create(testRunData);
            return TestRunCreationResult.Created;
        }

        public IEnumerable<TestRun> Runs(Guid contentId, string culture)
        {
            var runs = _testRunRepository.Runs(contentId, culture);

            return runs.Select(run => _testRunMapperServices[run.ResultPayloadVersion].Map(run));
        }
    }
}
