namespace AccessibilityReporter.Services.Interfaces
{
	public interface ITestableNodesService
	{
		IEnumerable<TestableNode> All();

		// Default-bodied so adding this overload doesn't break existing external implementers that
		// only defined All() - they keep compiling and keep their prior (culture-blind) behaviour
		// unless they choose to override this too.
		IEnumerable<TestableNode> All(string? culture) => All();
	}
}
