namespace AccessibilityReporter.Core.Interfaces
{
    public interface IAccessibilityReporterSettings
    {
		string ApiUrl { get; set; }

		string TestBaseUrl { get; set; }

		bool RunTestsAutomatically { get; set; }

		bool IncludeIfNoTemplate { get; set; }

		int MaxPages { get; set; }

		HashSet<string> UserGroups { get; set; }

		HashSet<string> TestsToRun { get; set; }

		HashSet<string> ExcludedDocTypes { get; set; }
	}
}
