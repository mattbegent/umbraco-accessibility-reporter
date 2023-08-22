using AccessibilityReporter.Core.Models;
using AccessibilityReporter.Services.Interfaces;
using Umbraco.Cms.Core.Routing;
using Umbraco.Extensions;

namespace AccessibilityReporter.Services
{
	internal class TestableNodesSummaryService : ITestableNodesSummaryService
	{
		private readonly ITestableNodesService _testableNodesService;
		private readonly IPublishedUrlProvider _publishedUrlProvider;

		public TestableNodesSummaryService(ITestableNodesService testableNodesService,
			IPublishedUrlProvider publishedUrlProvider)
		{
			_testableNodesService = testableNodesService;
			_publishedUrlProvider = publishedUrlProvider;
		}

		public IEnumerable<NodeSummary> All()
		{
			var content = _testableNodesService.All();

			return content.Select(c => new NodeSummary(c, _publishedUrlProvider));
		}
	}
}
