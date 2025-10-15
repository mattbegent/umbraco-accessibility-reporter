using AccessibilityReporter.Core.Interfaces;
using AccessibilityReporter.Services.Interfaces;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.Services.Navigation;
using Umbraco.Cms.Core.Web;

namespace AccessibilityReporter.Services
{
	public class DefaultTestableNodesService : ITestableNodesService
	{
		private readonly IUmbracoContextFactory _contextFactory;
		private readonly IDocumentNavigationQueryService _documentNavigationQueryService;
		private readonly IAccessibilityReporterSettings _settings;

		public DefaultTestableNodesService(IUmbracoContextFactory contextFactory,
			IDocumentNavigationQueryService documentNavigationQueryService,
			IAccessibilityReporterSettings settings)
        {
            _contextFactory = contextFactory;
            _documentNavigationQueryService = documentNavigationQueryService;
			_settings = settings;
        }

		public IEnumerable<IPublishedContent> All()
		{
			using (var contextReference = _contextFactory.EnsureUmbracoContext())
			{
				var rootItems = _documentNavigationQueryService.TryGetRootKeys(out var rootKeys) ? rootKeys : Enumerable.Empty<Guid>();

				var everything = new List<IPublishedContent>();

				foreach (var rootKey in rootItems)
				{
					var rootContent = contextReference.UmbracoContext.Content?.GetById(rootKey);
					if (rootContent != null)
					{
						everything.Add(rootContent);
						everything.AddRange(GetDescendants(rootContent));
					}
				}

				return everything.Where(DocumentTypeIsApplicable)
					.Where(TemplateStateIsApplicable)
					.Take(_settings.MaxPages);

				bool DocumentTypeIsApplicable(IPublishedContent content)
					=> _settings.ExcludedDocTypes.Contains(content.ContentType.Alias) == false;

				bool TemplateStateIsApplicable(IPublishedContent content)
					=> _settings.IncludeIfNoTemplate || content.TemplateId.HasValue;
			}
		}

		private IEnumerable<IPublishedContent> GetDescendants(IPublishedContent content)
		{
			if (_documentNavigationQueryService.TryGetChildrenKeys(content.Key, out var childKeys))
			{
				foreach (var childKey in childKeys)
				{
					// Get the child content from the Umbraco context
					using var contextReference = _contextFactory.EnsureUmbracoContext();
					var childContent = contextReference.UmbracoContext.Content?.GetById(childKey);
					if (childContent != null)
					{
						yield return childContent;
						// Recursively get descendants
						foreach (var descendant in GetDescendants(childContent))
						{
							yield return descendant;
						}
					}
				}
			}
		}
	}
}
