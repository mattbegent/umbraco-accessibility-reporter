using AccessibilityReporter.Core.Interfaces;
using AccessibilityReporter.Core.Models;
using System.Threading;
using System.Threading.Tasks;

namespace AccessibilityReporter.Infrastructure.Services
{
    /// <summary>
    /// Fallback implementation used when the Umbraco.Community.AccessibilityReporter.AI
    /// add-on package is not installed. Always reports AI as unavailable.
    /// </summary>
    internal class NoOpAiReportSummaryService : IAiReportSummaryService
    {
        public bool IsAvailable => false;

        public Task<AiSummaryResponse> GetSummaryAsync(AiSummaryRequest request, CancellationToken cancellationToken = default)
            => Task.FromResult(new AiSummaryResponse { Available = false });

        public Task<AiSummaryResponse> GetSiteSummaryAsync(AiSiteSummaryRequest request, CancellationToken cancellationToken = default)
            => Task.FromResult(new AiSummaryResponse { Available = false });

        public Task<AiSummaryResponse> GetAccessibilityStatementAsync(AiAccessibilityStatementRequest request, CancellationToken cancellationToken = default)
            => Task.FromResult(new AiSummaryResponse { Available = false });
    }
}
