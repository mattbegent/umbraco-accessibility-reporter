namespace AccessibilityReporter.Core.Models
{
    public class AiManualTestsRequest
    {
        public string PageUrl { get; set; } = string.Empty;

        public string PageName { get; set; } = string.Empty;

        public string PageHtml { get; set; } = string.Empty;

        public int Score { get; set; }

        public List<AiViolationInfo> Violations { get; set; } = new();

        public int IncompleteCount { get; set; }

        public List<string> DefaultTests { get; set; } = new();
    }
}
