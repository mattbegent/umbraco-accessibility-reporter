using AccessibilityReporter.Core.Models;

namespace AccessibilityReporter.Services.Interfaces
{
	public interface ITestableNodesSummaryService
	{
		IEnumerable<NodeSummary> All();
		IEnumerable<NodeSummary> All(string? culture);
	}
}
