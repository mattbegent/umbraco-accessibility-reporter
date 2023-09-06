using Umbraco.Cms.Core.Models.PublishedContent;

namespace AccessibilityReporter.Services.Interfaces
{
    public interface INodeUrlService
    {
        string AbsoluteUrl(IPublishedContent content);
    }
}
