using AccessibilityReporter.Core.Models;

namespace AccessibilityReporter.Core.Interfaces
{
    public interface IAiReportSummaryService
    {
        /// <summary>
        /// Returns true when an AI provider is configured and available.
        /// </summary>
        bool IsAvailable { get; }

        /// <summary>
        /// Generates an AI-powered plain-text summary of the supplied accessibility report.
        /// </summary>
        Task<AiSummaryResponse> GetSummaryAsync(AiSummaryRequest request, CancellationToken cancellationToken = default);
    }
}
