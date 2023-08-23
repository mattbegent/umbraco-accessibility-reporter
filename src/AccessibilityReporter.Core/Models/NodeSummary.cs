using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.Routing;
using Umbraco.Extensions;

namespace AccessibilityReporter.Core.Models
{
	public class NodeSummary
	{
        public NodeSummary(IPublishedContent content, IPublishedUrlProvider publishedUrlProvider)
        {
			Guid = content.Key;
			Id = content.Id;
			Name = content.Name!;
			DocTypeAlias = content.ContentType.Alias;
			Url = content.Url(publishedUrlProvider, mode: UrlMode.Absolute);
        }

        public Guid Guid { get; }

		public int Id { get; }

		public string Name { get; }

		public string DocTypeAlias { get; }

		public string Url { get; }
	}
}
