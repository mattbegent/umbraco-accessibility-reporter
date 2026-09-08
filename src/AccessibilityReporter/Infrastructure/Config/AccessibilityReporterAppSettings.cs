using AccessibilityReporter.Core.Interfaces;
using System.Collections.Generic;

namespace AccessibilityReporter.Infrastructure.Config
{
	internal class AccessibilityReporterAppSettings : IAccessibilityReporterSettings
	{
		public static string SectionName = "AccessibilityReporter";

		public string ApiUrl { get; set; } = string.Empty;

		public string TestBaseUrl { get; set; } = string.Empty;

		public IDictionary<string, string> SiteBaseUrls { get; set; } = new Dictionary<string, string>();

		public bool RunTestsAutomatically { get; set; } = true;

		public int HistoryRetentionDays { get; set; } = 365;

		public int MaxCacheAgeHours { get; set; } = 24;

		public bool IncludeIfNoTemplate { get; set; } = false;

		public int MaxPages { get; set; } = 50;

		public HashSet<string> UserGroups { get; set; } = new HashSet<string>();
        
		public HashSet<string> TestsToRun { get; set; } = new HashSet<string>();

		public HashSet<string> ExcludedDocTypes { get; set; } = new HashSet<string>();
	}
}
