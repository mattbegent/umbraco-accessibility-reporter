using AccessibilityReporter.Core.Models;

namespace AccessibilityReporter.Core.Interfaces
{
    public interface IAiReadabilityService
    {
        /// <summary>
        /// Returns true when an AI provider is configured and available.
        /// </summary>
        bool IsAvailable { get; }

        /// <summary>
        /// Analyses the supplied rich text content for readability according to
        /// WCAG 2.2 SC 3.1.5 (Reading Level) and returns a simplified version
        /// along with an explanation of the changes.
        /// </summary>
        Task<AiReadabilityResponse> AnalyseReadabilityAsync(AiReadabilityRequest request, CancellationToken cancellationToken = default);
    }
}
