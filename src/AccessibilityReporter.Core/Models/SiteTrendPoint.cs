namespace AccessibilityReporter.Core.Models
{
    public class SiteTrendPoint
    {
        public DateTime Date { get; set; }

        public int AverageScore { get; set; }

        public int PagesTested { get; set; }

        public int TotalViolations { get; set; }
    }
}
