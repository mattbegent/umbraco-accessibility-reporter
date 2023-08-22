using Umbraco.Cms.Core.Models.PublishedContent;

namespace AccessibilityReporter.Services.Interfaces
{
	public interface ITestableNodesService
	{
		IEnumerable<IPublishedContent> All();
	}
}
