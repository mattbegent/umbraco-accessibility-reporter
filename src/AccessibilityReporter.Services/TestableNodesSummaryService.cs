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
            var testableNodes = _testableNodesService.All(culture);

            foreach (var node in testableNodes)
            {
                var content = node.Content;
                var url = _nodeUrlService.AbsoluteUrl(content, node.Root, culture);

                // Umbraco's URL provider returns "#" when it can't resolve a URL, notably when the
                // requested culture isn't a published variant for this content. In a multisite install
                // different sites can support different culture sets, so skip nodes that don't support
                // the requested culture rather than testing a broken "#" URL.
                if (!string.IsNullOrEmpty(culture) && url == "#")
                {
                    continue;
                }

                var idAttempt = _idKeyMap.GetIdForKey(content.Key, UmbracoObjectTypes.Document);

                yield return new NodeSummary(
                    content,
                    url,
                    idAttempt.Success ? idAttempt.Result : 0,
                    PublishedContentNameResolver.GetName(content, _variationContextAccessor, culture),
                    node.Root.Key,
                    PublishedContentNameResolver.GetName(node.Root, _variationContextAccessor, null));
            }
        }
    }
}
