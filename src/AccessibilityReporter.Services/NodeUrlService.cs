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

        public string AbsoluteUrl(IPublishedContent content)
        {
            if (string.IsNullOrWhiteSpace(_settings.TestBaseUrl))
            {
                return content.Url(_publishedUrlProvider, mode: UrlMode.Absolute);
            }

            return $"{_settings.TestBaseUrl.TrimEnd("/")}{content.Url(_publishedUrlProvider, mode: UrlMode.Relative)}";
        }
    }
}
