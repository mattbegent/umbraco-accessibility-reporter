using Umbraco.Cms.Core.Models.PublishedContent;

namespace AccessibilityReporter.Services.Interfaces
{
    public interface INodeUrlService
    {
        string AbsoluteUrl(IPublishedContent content, IPublishedContent root);
        string AbsoluteUrl(IPublishedContent content, IPublishedContent root, string? culture);
    }
}
