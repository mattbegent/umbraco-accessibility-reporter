namespace AccessibilityReporter.Core.Models
{
    public class AiHistorySummaryRequest
    {
        public string PageName { get; set; } = string.Empty;

        public string PageUrl { get; set; } = string.Empty;

        public List<AiHistoryRunInfo> Runs { get; set; } = new();

        public List<AiHistoryViolationSummary> FrequentViolations { get; set; } = new();
    }

    public class AiHistoryRunInfo
    {
        public string RunDate { get; set; } = string.Empty;

        public int Score { get; set; }

        public int FailedCount { get; set; }

        public int PassedCount { get; set; }

        public int IncompleteCount { get; set; }
    }

    public class AiHistoryViolationSummary
    {
        public string Id { get; set; } = string.Empty;

        public string Impact { get; set; } = string.Empty;

        public string Help { get; set; } = string.Empty;

        public int AppearanceCount { get; set; }
    }
}
