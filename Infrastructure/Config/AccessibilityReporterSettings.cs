using System.Collections.Generic;

namespace AccessibilityReporter.Infrastructure.Config
{
    public class AccessibilityReporterSettings
    {
        public static string SectionName = "AccessibilityReporter";

        public string ApiUrl { get; set; }

        public string TestBaseUrl { get; set; }

        public bool RunTestsAutomatically { get; set; }

        public IEnumerable<TestBaseUrl> MultisiteTestBaseUrls { get; set; }

        public IEnumerable<string> UserGroups { get; set; }
    }
}
