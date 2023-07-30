using System.Collections.Generic;

namespace AccessibilityReporter.Infrastructure.Config
{
    internal class AccessibilityReporterAppSettings : IAccessibilityReporterSettings
	{
        public static string SectionName = "AccessibilityReporter";

        public string ApiUrl { get; set; } = string.Empty;

        public string TestBaseUrl { get; set; } = string.Empty;

        public bool RunTestsAutomatically { get; set; } = true;

        public HashSet<string> UserGroups { get; set; } 

        public HashSet<string> TestsToRun { get; set; }

        public HashSet<string> ExcludedDocTypes { get; set; }
    }
}
