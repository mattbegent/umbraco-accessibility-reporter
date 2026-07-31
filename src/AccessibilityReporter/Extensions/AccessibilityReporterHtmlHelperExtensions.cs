using System.Text.Json;
using Microsoft.AspNetCore.Html;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace AccessibilityReporter.Extensions
{
	public static class AccessibilityReporterHtmlHelperExtensions
	{
		// Must match the activation name accessibility-reporter.service.ts sets as the test iframe's
		// window.name, and the guard at the top of accessibility-reporter-bridge.js.
		private const string ActivationName = "accessibility-reporter-bridge-activate";

		/// <summary>
		/// Renders a small inline script that lets Accessibility Reporter test this page even when it's
		/// on a different domain to the Umbraco backoffice. It only ever does anything while
		/// Accessibility Reporter itself is running a test - for every other visit it's an inert,
		/// zero-network-request no-op, so it's safe to leave in a shared layout permanently. See the
		/// "Testing sites on a different domain" section of the package README.
		/// </summary>
		/// <param name="bridgeOrigin">
		/// Base URL that serves this package's static assets, e.g. "https://cms.example.com". Defaults to
		/// the current request's own origin, which is correct whenever this site and the Umbraco
		/// backoffice are served by the same running application (the common case for a multi-domain
		/// Umbraco install, where different domains are simply bound to different root nodes) - only
		/// pass this explicitly if this page is rendered by a genuinely separate application.
		/// </param>
		public static IHtmlContent AccessibilityReporterScript(this IHtmlHelper htmlHelper, string? bridgeOrigin = null)
		{
			var request = htmlHelper.ViewContext.HttpContext.Request;
			var origin = string.IsNullOrWhiteSpace(bridgeOrigin)
				? $"{request.Scheme}://{request.Host}"
				: bridgeOrigin!.TrimEnd('/');

			var bridgeUrl = $"{origin}/App_Plugins/AccessibilityReporter/libs/accessibility-reporter-bridge.js";

			// Both values are embedded as JSON string literals - the standard-safe way to put a string
			// into an inline <script> block - with "<" additionally escaped so a value containing
			// "</script>" (bridgeUrl is derived from the request's Host header, which callers should
			// already be validating, but this is cheap, worthwhile defense-in-depth) can't prematurely
			// close the surrounding script tag as far as the HTML parser is concerned.
			var script = $$"""
				<script>
				(function () {
				  if (window.name !== {{ToScriptString(ActivationName)}}) return;
				  var s = document.createElement('script');
				  s.src = {{ToScriptString(bridgeUrl)}};
				  document.head.appendChild(s);
				})();
				</script>
				""";

			return new HtmlString(script);
		}

		private static string ToScriptString(string value)
			=> JsonSerializer.Serialize(value).Replace("<", "\\u003c");
	}
}
