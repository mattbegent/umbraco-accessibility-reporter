using System.Collections.Generic;

namespace AccessibilityReporter.Infrastructure.Config
{
    public class AccessibilityReporterSettings
    {
        public static string SectionName = "AccessibilityReporter";

        public string ApiUrl { get; set; } = string.Empty;

        public string TestBaseUrl { get; set; } = string.Empty;

        public bool RunTestsAutomatically { get; set; } = true;

        public HashSet<string> UserGroups { get; set; } 

        public HashSet<string> TestsToRun { get; set; }

        public HashSet<string> ExcludedDocTypes { get; set; }

        public AccessibilityReporterSettings WithDefaults()
        {
            if (UserGroups == null)
            {
                UserGroups = new HashSet<string>() { "admin", "editor", "writer", "translator", "sensitiveData" };
            }

            if (TestsToRun == null)
            {
                TestsToRun = new HashSet<string>() { "wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice" };
            }

            return this;
        }
    }
}
