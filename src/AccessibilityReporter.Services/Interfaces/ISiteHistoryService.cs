using AccessibilityReporter.Core.Models;

namespace AccessibilityReporter.Services.Interfaces
{
    public interface ISiteHistoryService
    {
        IEnumerable<SiteSummary> Sites();

        IEnumerable<SiteTrendPoint> Trend(Guid rootContentId, string? culture);
    }
}
