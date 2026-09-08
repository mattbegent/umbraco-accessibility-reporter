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

		public IEnumerable<TestableNode> All(string? culture)
		{
			using (var contextReference = _contextFactory.EnsureUmbracoContext())
			{
				var rootItems = _documentNavigationQueryService.TryGetRootKeys(out var rootKeys) ? rootKeys : Enumerable.Empty<Guid>();

				// Build one list of applicable nodes per root/site, rather than one big concatenated
				// list, so a single large site can't consume the entire MaxPages budget and starve
				// every other site in a multisite install (see Interleave below).
				var perRoot = new List<List<TestableNode>>();

				foreach (var rootKey in rootItems)
				{
					var rootContent = contextReference.UmbracoContext.Content?.GetById(rootKey);
					if (rootContent == null)
					{
						continue;
					}

					var siteNodes = new List<IPublishedContent> { rootContent };
					siteNodes.AddRange(GetDescendants(rootContent));

					perRoot.Add(siteNodes.Where(DocumentTypeIsApplicable)
						.Where(TemplateStateIsApplicable)
						.Where(CultureIsApplicable)
						.Select(content => new TestableNode(content, rootContent))
						.ToList());
				}

				return Interleave(perRoot).Take(_settings.MaxPages);

				bool DocumentTypeIsApplicable(IPublishedContent content)
					=> _settings.ExcludedDocTypes.Contains(content.ContentType.Alias) == false;

				bool TemplateStateIsApplicable(IPublishedContent content)
					=> _settings.IncludeIfNoTemplate || content.TemplateId.HasValue;

				bool CultureIsApplicable(IPublishedContent content)
					=> string.IsNullOrEmpty(culture) || content.IsPublished(culture);
			}
		}

		// Round-robins across each root's nodes (site1[0], site2[0], site3[0], site1[1], ...) so that
		// applying Take(MaxPages) afterwards gives every site fair representation instead of exhausting
		// the budget on whichever root happened to be enumerated first.
		private static IEnumerable<TestableNode> Interleave(List<List<TestableNode>> perRoot)
		{
			var indices = new int[perRoot.Count];
			bool any;
			do
			{
				any = false;
				for (int i = 0; i < perRoot.Count; i++)
				{
					if (indices[i] < perRoot[i].Count)
					{
						yield return perRoot[i][indices[i]];
						indices[i]++;
						any = true;
					}
				}
			} while (any);
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
