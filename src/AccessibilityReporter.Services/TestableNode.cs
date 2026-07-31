using Umbraco.Cms.Core.Models.PublishedContent;

namespace AccessibilityReporter.Services
{
	// Pairs a testable content node with the root of the site it belongs to. The root is captured
	// while walking the tree in DefaultTestableNodesService (where it's already known) rather than
	// re-derived later via IPublishedContent.Parent, which is obsolete and removed entirely in
	// Umbraco 18 (see PublishedContentNameResolver for the same cross-version constraint).
	public sealed class TestableNode
	{
		public TestableNode(IPublishedContent content, IPublishedContent root)
		{
			Content = content;
			Root = root;
		}

		public IPublishedContent Content { get; }

		public IPublishedContent Root { get; }
	}
}
