using AccessibilityReporter.Core.Models;
using AccessibilityReporter.Services.Interfaces;
using Umbraco.Extensions;

namespace AccessibilityReporter.Services
{
	internal class TestableNodesSummaryService : ITestableNodesSummaryService
	{
		private readonly ITestableNodesService _testableNodesService;
		private readonly INodeUrlService _nodeUrlService;

		public TestableNodesSummaryService(ITestableNodesService testableNodesService,
			INodeUrlService nodeUrlService)
		{
			_testableNodesService = testableNodesService;
			_nodeUrlService = nodeUrlService;
		}

		public IEnumerable<NodeSummary> All()
		{
			var content = _testableNodesService.All();

			return content.Select(c => new NodeSummary(c, _nodeUrlService.AbsoluteUrl(c)));
		}
	}
}
