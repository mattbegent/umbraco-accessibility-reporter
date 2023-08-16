using System.Collections.Generic;
using System.Linq;

namespace AccessibilityReporter.Infrastructure.Config
{
    internal class AccessibilityReporterSettingsFactory
	{
		internal static IAccessibilityReporterSettings Make(AccessibilityReporterAppSettings settings)
		{
			if (settings.UserGroups.Any() == false)
			{
				settings.UserGroups = new HashSet<string>() { "admin", "editor", "writer", "translator", "sensitiveData" };
			}

			if (settings.TestsToRun.Any() == false)
			{
				settings.TestsToRun = new HashSet<string>() { "wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice" };
			}

			return settings;
		}
	}
}
