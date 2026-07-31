using AccessibilityReporter.Core.Interfaces;
using AccessibilityReporter.Services.Interfaces;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.Routing;
using Umbraco.Extensions;

namespace AccessibilityReporter.Services
{
    internal class NodeUrlService : INodeUrlService
    {
        private readonly IPublishedUrlProvider _publishedUrlProvider;
        private readonly IAccessibilityReporterSettings _settings;

        public NodeUrlService(IPublishedUrlProvider publishedUrlProvider,
            IAccessibilityReporterSettings settings)
        {
            _publishedUrlProvider = publishedUrlProvider;
            _settings = settings;
        }

        public string AbsoluteUrl(IPublishedContent content, IPublishedContent root)
        {
            return AbsoluteUrl(content, root, null);
        }

        public string AbsoluteUrl(IPublishedContent content, IPublishedContent root, string? culture)
        {
            var resolvedUrl = content.Url(_publishedUrlProvider, culture: culture, mode: UrlMode.Absolute);

            // A domain is bound to this node's root, so Umbraco could already resolve a real,
            // domain-qualified URL - trust it over any configured override. This is what makes
            // multisite installs with proper domain bindings work per-site with no config at all.
            if (IsAbsolute(resolvedUrl))
            {
                return resolvedUrl;
            }

            // No domain is bound (typical for headless setups). Prefer a per-site override so a
            // multisite install with several distinct frontends doesn't get every page forced onto
            // one shared base URL, then fall back to the single global override.
            var baseUrl = GetSiteBaseUrl(root) ?? _settings.TestBaseUrl;

            if (string.IsNullOrWhiteSpace(baseUrl))
            {
                return resolvedUrl;
            }

            return $"{baseUrl.TrimEnd('/')}{content.Url(_publishedUrlProvider, culture: culture, mode: UrlMode.Relative)}";
        }

        private string? GetSiteBaseUrl(IPublishedContent root)
        {
            return _settings.SiteBaseUrls.TryGetValue(root.Key.ToString(), out var baseUrl) && !string.IsNullOrWhiteSpace(baseUrl)
                ? baseUrl
                : null;
        }

        private static bool IsAbsolute(string url)
        {
            return url.StartsWith("http://", StringComparison.OrdinalIgnoreCase)
                || url.StartsWith("https://", StringComparison.OrdinalIgnoreCase);
        }
    }
}
