using Umbraco.Cms.Core.Models.PublishedContent;

namespace AccessibilityReporter.Core.Models
{
	public class NodeSummary
	{
        public NodeSummary(IPublishedContent content, string url, int id, string name)
        {
			Guid = content.Key;
			Id = id;
			Name = name;
			DocTypeAlias = content.ContentType.Alias;
			Url = url;
        }

        public Guid Guid { get; }

		public int Id { get; }

		public string Name { get; }

		public string DocTypeAlias { get; }

		public string Url { get; }
	}
}
