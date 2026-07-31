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

		bool IncludeIfNoTemplate { get; set; }

		int MaxPages { get; set; }

		HashSet<string> UserGroups { get; set; }

		HashSet<string> TestsToRun { get; set; }

		HashSet<string> ExcludedDocTypes { get; set; }
	}
}
