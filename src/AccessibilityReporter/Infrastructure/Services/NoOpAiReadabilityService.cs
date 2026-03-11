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
    internal class NoOpAiReadabilityService : IAiReadabilityService
    {
        public bool IsAvailable => false;

        public Task<AiReadabilityResponse> AnalyseReadabilityAsync(AiReadabilityRequest request, CancellationToken cancellationToken = default)
            => Task.FromResult(new AiReadabilityResponse { Available = false });
    }
}
