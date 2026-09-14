namespace AccessibilityReporter.Core.Interfaces
{
    public interface IAccessibilityReporterSettings
    {
		string ApiUrl { get; set; }

		string TestBaseUrl { get; set; }

		/// <summary>
		/// Per-site base URL overrides for multisite/headless installs where no domain is bound to
		/// a root node, keyed by that root node's Key (Guid, as found on the node's Info tab).
		/// Checked before the single global <see cref="TestBaseUrl"/> fallback.
		/// </summary>
		IDictionary<string, string> SiteBaseUrls { get; set; }

		bool RunTestsAutomatically { get; set; }

		/// <summary>
		/// Number of days of test run history to keep before it's cleaned up by a daily recurring
		/// background job. A value of 0 or less disables cleanup and keeps history indefinitely.
		/// </summary>
		int HistoryRetentionDays { get; set; }

		/// <summary>
		/// Maximum age, in hours, of the last stored test run before the workspace view treats it as
		/// stale and runs a fresh test instead of displaying it. A value of 0 or less disables the
		/// age check, so the cached run is only invalidated when the content itself has changed.
		/// </summary>
		int MaxCacheAgeHours { get; set; }

		bool IncludeIfNoTemplate { get; set; }

		int MaxPages { get; set; }

		HashSet<string> UserGroups { get; set; }

		HashSet<string> TestsToRun { get; set; }

		HashSet<string> ExcludedDocTypes { get; set; }
	}
}
