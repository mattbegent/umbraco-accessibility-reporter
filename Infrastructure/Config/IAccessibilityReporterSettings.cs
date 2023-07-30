using System.Collections.Generic;

namespace AccessibilityReporter.Infrastructure.Config
{
    public interface IAccessibilityReporterSettings
    {
		string ApiUrl { get; set; }

		string TestBaseUrl { get; set; }

		bool RunTestsAutomatically { get; set; }

		HashSet<string> UserGroups { get; set; }

		HashSet<string> TestsToRun { get; set; }

		HashSet<string> ExcludedDocTypes { get; set; }
	}
}
