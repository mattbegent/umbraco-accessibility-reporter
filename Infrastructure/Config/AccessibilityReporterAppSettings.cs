using System.Collections.Generic;

namespace AccessibilityReporter.Infrastructure.Config
{
    public class AccessibilityReporterAppSettings 
	{
        public static string SectionName = "AccessibilityReporter";

        public string ApiUrl { get; set; } = string.Empty;

        public string TestBaseUrl { get; set; } = string.Empty;

        public bool RunTestsAutomatically { get; set; } = true;

        public HashSet<string> UserGroups { get; set; } = new HashSet<string>() { "admin", "editor", "writer", "translator", "sensitiveData" };

		public HashSet<string> TestsToRun { get; set; } = new HashSet<string>() { "wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice" };

        public HashSet<string> ExcludedDocTypes { get; set; } = new HashSet<string>();

        public int MaxPages { get; set;} = 50;
    }
}
