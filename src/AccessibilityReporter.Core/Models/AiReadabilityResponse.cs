namespace AccessibilityReporter.Core.Models
{
    public class AiReadabilityResponse
    {
        /// <summary>
        /// True when Umbraco.AI is installed and a provider is configured.
        /// </summary>
        public bool Available { get; set; }

        /// <summary>
        /// The rewritten HTML with improved readability, or null when unavailable or on error.
        /// </summary>
        public string? ImprovedHtml { get; set; }

        /// <summary>
        /// A plain-language summary of what was changed and why.
        /// </summary>
        public string? Explanation { get; set; }
    }
}
