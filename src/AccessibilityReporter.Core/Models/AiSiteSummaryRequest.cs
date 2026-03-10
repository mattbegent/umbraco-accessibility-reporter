namespace AccessibilityReporter.Core.Models
{
    public class AiSiteSummaryRequest
    {
        public int AverageScore { get; set; }

        public int TotalPages { get; set; }

        public int TotalViolations { get; set; }

        public List<AiSitePageInfo> Pages { get; set; } = new();

        public List<AiSiteViolationSummary> MostCommonViolations { get; set; } = new();
    }

    public class AiSitePageInfo
    {
        public string Name { get; set; } = string.Empty;

        public string Url { get; set; } = string.Empty;

        public int Score { get; set; }

        public int ViolationCount { get; set; }
    }

    public class AiSiteViolationSummary
    {
        public string Id { get; set; } = string.Empty;

        public string Impact { get; set; } = string.Empty;

        public string Help { get; set; } = string.Empty;

        public int TotalOccurrences { get; set; }

        public int AffectedPages { get; set; }
    }
}
