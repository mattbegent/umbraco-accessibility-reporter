using System.Collections.Generic;
using System.Linq;

namespace AccessibilityReporter.Infrastructure.Config
{
    public class AccessibilityReporterSettings
    {
        public static string SectionName = "AccessibilityReporter";

        public string ApiUrl { get; set; } = string.Empty;

        public string TestBaseUrl { get; set; } = string.Empty;

        public bool RunTestsAutomatically { get; set; }

        public HashSet<string> UserGroups { get; set; } = new HashSet<string>();

        public HashSet<string> TestsToRun { get; set; } = new HashSet<string>();

        public AccessibilityReporterSettings WithDefaults()
        {
            if (UserGroups.Any() == false)
            {
                UserGroups = new HashSet<string>() { "admin", "editor", "writer" };
            }

            if (TestsToRun.Any() == false)
            {
                TestsToRun = new HashSet<string>() { "wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa" };
            }

            return this;
        }
    }
}
