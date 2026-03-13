namespace AccessibilityReporter.Core.Models
{
    public class AiAccessibilityStatementRequest
    {
        public string WebsiteName { get; set; } = string.Empty;

        public string WebsiteUrl { get; set; } = string.Empty;

        public string OrganisationName { get; set; } = string.Empty;

        public int AverageScore { get; set; }

        public int TotalPages { get; set; }

        public int TotalViolations { get; set; }

        public List<AiSitePageInfo> Pages { get; set; } = new();

        public List<AiSiteViolationSummary> MostCommonViolations { get; set; } = new();
    }
}
