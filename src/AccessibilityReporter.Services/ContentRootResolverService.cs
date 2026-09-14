using AccessibilityReporter.Core.Interfaces;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.Services.Navigation;
using Umbraco.Cms.Core.Web;

namespace AccessibilityReporter.Services
{
    // Resolves an arbitrary content Guid to its site root using the same navigation-service tree walk
    // as DefaultTestableNodesService, rather than IPublishedContent.Parent/Ancestors, which is
    // obsolete and removed entirely in Umbraco 18 (see PublishedContentNameResolver).
    internal class ContentRootResolverService : IContentRootResolverService
    {
        private readonly IUmbracoContextFactory _contextFactory;
        private readonly IDocumentNavigationQueryService _documentNavigationQueryService;
        private readonly IVariationContextAccessor _variationContextAccessor;

        public ContentRootResolverService(IUmbracoContextFactory contextFactory,
            IDocumentNavigationQueryService documentNavigationQueryService,
            IVariationContextAccessor variationContextAccessor)
        {
            _contextFactory = contextFactory;
            _documentNavigationQueryService = documentNavigationQueryService;
            _variationContextAccessor = variationContextAccessor;
        }

        public (Guid RootId, string RootName)? Resolve(Guid contentId)
        {
            if (!_documentNavigationQueryService.TryGetRootKeys(out var rootKeys))
            {
                return null;
            }

            if (!_documentNavigationQueryService.TryGetAncestorsOrSelfKeys(contentId, out var ancestorsOrSelfKeys))
            {
                return null;
            }

            var rootKeySet = rootKeys.ToHashSet();

            Guid? rootKey = null;
            foreach (var key in ancestorsOrSelfKeys)
            {
                if (rootKeySet.Contains(key))
                {
                    rootKey = key;
                    break;
                }
            }

            if (rootKey is null)
            {
                return null;
            }

            using var contextReference = _contextFactory.EnsureUmbracoContext();
            var rootContent = contextReference.UmbracoContext.Content?.GetById(rootKey.Value);
            if (rootContent == null)
            {
                return null;
            }

            return (rootKey.Value, PublishedContentNameResolver.GetName(rootContent, _variationContextAccessor, null));
        }
    }
}
