using AccessibilityReporter.Core.Interfaces;
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
        private readonly IContentRootResolverService _contentRootResolverService;
        private readonly Dictionary<int, ITestRunMapperService> _testRunMapperServices;

        // Basic versioning implementation in case we need to change the payload structure in the future, fixed at v1 for now
        private const int PayloadVersion = 1;

        public TestRunService(ITestRunRepository testRunRepository,
            IContentRootResolverService contentRootResolverService,
            IEnumerable<ITestRunMapperService> testRunMapperServices)
        {
            _testRunRepository = testRunRepository;
            _contentRootResolverService = contentRootResolverService;
            _testRunMapperServices = testRunMapperServices.ToDictionary(mapper => mapper.ApplicableVersion, mapper => mapper);
        }

        public TestRunCreationResult Create(Guid contentId, string culture, string contentHash, string resultPayload)
        {
            // Resolved server-side (rather than trusting a client-supplied site id) so history stays
            // attributable to a site even if the page's since moved, and can't be spoofed by the client.
            var root = _contentRootResolverService.Resolve(contentId);

            var testRunData = new TestRunData
            {
                ContentId = contentId,
                Culture = culture,
                ContentHash = contentHash,
                ResultPayload = resultPayload,
                RunCompleted = DateTime.Now,
                ResultPayloadVersion = PayloadVersion,
                RootContentId = root?.RootId,
                RootName = root?.RootName
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
