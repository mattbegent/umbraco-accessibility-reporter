namespace AccessibilityReporter.Core.Models
{
    public class AiReadabilityRequest
    {
        /// <summary>
        /// The HTML content from the rich text editor to analyse.
        /// </summary>
        public string Html { get; set; } = string.Empty;
    }
}
