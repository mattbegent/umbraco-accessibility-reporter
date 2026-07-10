using AccessibilityReporter.Core.Models;
using AccessibilityReporter.Services.Interfaces;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.Services;

namespace AccessibilityReporter.Services
{
    internal class TestableNodesSummaryService : ITestableNodesSummaryService
    {
        private readonly ITestableNodesService _testableNodesService;
        private readonly INodeUrlService _nodeUrlService;
        private readonly IIdKeyMap _idKeyMap;
        private readonly IVariationContextAccessor _variationContextAccessor;

        public TestableNodesSummaryService(ITestableNodesService testableNodesService,
            INodeUrlService nodeUrlService,
            IIdKeyMap idKeyMap,
            IVariationContextAccessor variationContextAccessor)
        {
            _testableNodesService = testableNodesService;
            _nodeUrlService = nodeUrlService;
            _idKeyMap = idKeyMap;
            _variationContextAccessor = variationContextAccessor;
        }

        public IEnumerable<NodeSummary> All()
        {
            return All(null);
        }

        public IEnumerable<NodeSummary> All(string? culture)
        {
            var testableNodes = _testableNodesService.All();

            return testableNodes.Select(content =>
            {
                var idAttempt = _idKeyMap.GetIdForKey(content.Key, UmbracoObjectTypes.Document);

                return new NodeSummary(
                    content,
                    _nodeUrlService.AbsoluteUrl(content, culture),
                    idAttempt.Success ? idAttempt.Result : 0,
                    PublishedContentNameResolver.GetName(content, _variationContextAccessor, culture));
            });
        }
    }
}
