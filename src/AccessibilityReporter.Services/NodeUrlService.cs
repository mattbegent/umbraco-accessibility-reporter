using AccessibilityReporter.Core.Interfaces;
using AccessibilityReporter.Services.Interfaces;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.Routing;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Core.Web;
using Umbraco.Extensions;

namespace AccessibilityReporter.Services
{
    internal class NodeUrlService : INodeUrlService
    {
        private readonly IPublishedUrlProvider _publishedUrlProvider;
        private readonly IAccessibilityReporterSettings _settings;
        private readonly IRequestAccessor _requestAccessor;
        private readonly IIdKeyMap _idKeyMap;

        public NodeUrlService(IPublishedUrlProvider publishedUrlProvider,
            IAccessibilityReporterSettings settings,
            IRequestAccessor requestAccessor,
            IIdKeyMap idKeyMap)
        {
            _publishedUrlProvider = publishedUrlProvider;
            _settings = settings;
            _requestAccessor = requestAccessor;
            _idKeyMap = idKeyMap;
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
                return ShouldPreferRequestOrigin(root)
                    ? PreferRequestOrigin(content, resolvedUrl, culture)
                    : resolvedUrl;
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

        // ApiUrl isn't affected by CORS, and TestBaseUrl/SiteBaseUrls mean another domain is wanted
        // (e.g. a headless frontend), so only prefer the backoffice's domain when none are set.
        private bool ShouldPreferRequestOrigin(IPublishedContent root)
        {
            return string.IsNullOrWhiteSpace(_settings.ApiUrl)
                && string.IsNullOrWhiteSpace(_settings.TestBaseUrl)
                && GetSiteBaseUrl(root) == null;
        }

        // A culture can have several hostnames (e.g. admin and www). Testing one that isn't the
        // backoffice's own causes CORS errors, so use the backoffice's one if the page has it.
        private string PreferRequestOrigin(IPublishedContent content, string resolvedUrl, string? culture)
        {
            var requestUrl = _requestAccessor.GetRequestUrl();
            if (requestUrl == null
                || !Uri.TryCreate(resolvedUrl, UriKind.Absolute, out var resolvedUri)
                || IsSameOrigin(resolvedUri, requestUrl))
            {
                return resolvedUrl;
            }

            // IPublishedContent.Id moved to IPublishedElement in Umbraco 18, so look it up by key.
            var idAttempt = _idKeyMap.GetIdForKey(content.Key, UmbracoObjectTypes.Document);
            if (!idAttempt.Success)
            {
                return resolvedUrl;
            }

            var sameOriginUrl = _publishedUrlProvider.GetOtherUrls(idAttempt.Result, requestUrl)
                .Where(info => info.Url != null && info.Url.IsAbsoluteUri && IsSameOrigin(info.Url, requestUrl))
                .Where(info => string.IsNullOrEmpty(culture)
                    || string.IsNullOrEmpty(info.Culture)
                    || string.Equals(info.Culture, culture, StringComparison.OrdinalIgnoreCase))
                .Select(info => info.Url!.ToString())
                .FirstOrDefault();

            return sameOriginUrl ?? resolvedUrl;
        }

        private static bool IsSameOrigin(Uri a, Uri b)
        {
            return string.Equals(a.Scheme, b.Scheme, StringComparison.OrdinalIgnoreCase)
                && string.Equals(a.Host, b.Host, StringComparison.OrdinalIgnoreCase)
                && a.Port == b.Port;
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
