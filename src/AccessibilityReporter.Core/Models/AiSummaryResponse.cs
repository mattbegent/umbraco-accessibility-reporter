namespace AccessibilityReporter.Core.Models
{
    public class AiSummaryResponse
    {
        /// <summary>
        /// True when Umbraco.AI is installed and a provider is configured.
        /// False when the AI add-on is not installed.
        /// </summary>
        public bool Available { get; set; }

        /// <summary>
        /// The AI-generated summary text, or null if an error occurred.
        /// </summary>
        public string? Summary { get; set; }
    }
}
