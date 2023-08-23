using Umbraco.Cms.Core.Models.PublishedContent;

namespace AccessibilityReporter.Core.Models
{
	public class NodeSummary
	{
        public NodeSummary(IPublishedContent content, string url)
        {
			Guid = content.Key;
			Name = content.Name!;
			DocTypeAlias = content.ContentType.Alias;
			Url = url;
        }

        public Guid Guid { get; }

		public string Name { get; }

		public string DocTypeAlias { get; }

		public string Url { get; }
	}
}
