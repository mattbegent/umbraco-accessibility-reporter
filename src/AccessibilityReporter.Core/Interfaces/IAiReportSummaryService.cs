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

        /// <summary>
        /// Generates an AI-powered summary of the accessibility results across the whole website.
        /// </summary>
        Task<AiSummaryResponse> GetSiteSummaryAsync(AiSiteSummaryRequest request, CancellationToken cancellationToken = default);

        /// <summary>
        /// Generates an AI-powered accessibility statement based on the GOV.UK template,
        /// populated with data from the accessibility audit results.
        /// </summary>
        Task<AiSummaryResponse> GetAccessibilityStatementAsync(AiAccessibilityStatementRequest request, CancellationToken cancellationToken = default);

        /// <summary>
        /// Generates AI-tailored manual accessibility tests based on the page content and audit results.
        /// </summary>
        Task<AiSummaryResponse> GetManualTestsAsync(AiManualTestsRequest request, CancellationToken cancellationToken = default);
    }
}
