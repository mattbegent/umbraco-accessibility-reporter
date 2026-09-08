namespace AccessibilityReporter.Services.Interfaces
{
	public interface ITestableNodesService
	{
		IEnumerable<TestableNode> All(string? culture);
	}
}
