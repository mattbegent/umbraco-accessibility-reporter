namespace AccessibilityReporter.Core.Models
{
    public class AiSummaryRequest
    {
        public string PageUrl { get; set; } = string.Empty;

        public string PageName { get; set; } = string.Empty;

        public int Score { get; set; }

        public List<AiViolationInfo> Violations { get; set; } = new();

        public int IncompleteCount { get; set; }
    }

    public class AiViolationInfo
    {
        public string Id { get; set; } = string.Empty;

        public string Impact { get; set; } = string.Empty;

        public string Help { get; set; } = string.Empty;

        public int NodeCount { get; set; }
    }
}
