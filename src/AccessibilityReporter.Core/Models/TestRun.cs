namespace AccessibilityReporter.Core.Models
{
    public class TestRun
    {
        public Guid ContentId { get; set; }

        public DateTime RunCompleted { get; set; }

        public int Score { get; set; }

        public int FailedCount { get; set; }

        public int PassedCount { get; set; }

        public int IncompleteCount { get; set; }
    }
}
