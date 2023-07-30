﻿using System.Collections.Generic;

namespace AccessibilityReporter.Infrastructure.Config
{
    internal class AccessibilityReporterSettingsFactory
    {
        internal static IAccessibilityReporterSettings Make(AccessibilityReporterAppSettings settings)
        {
            if (settings.UserGroups == null)
            {
				settings.UserGroups = new HashSet<string>() { "admin", "editor", "writer", "translator", "sensitiveData" };
			}

            if (settings.TestsToRun == null)
            {
				settings.TestsToRun = new HashSet<string>() { "wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice" };
			}

			settings.ExcludedDocTypes = settings.ExcludedDocTypes ?? new HashSet<string>();

            return settings;
        }
    }
}
