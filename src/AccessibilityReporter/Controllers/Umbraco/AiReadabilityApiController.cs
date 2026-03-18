using AccessibilityReporter.Core.Interfaces;
using AccessibilityReporter.Core.Models;
using Asp.Versioning;
using Microsoft.AspNetCore.Mvc;
using System.Threading;
using System.Threading.Tasks;

namespace AccessibilityReporter.Controllers.Umbraco
{
    [ApiVersion("1.0")]
    [ApiExplorerSettings(GroupName = "AiReadability")]
    public class AiReadabilityApiController : AccessibilityReporterControllerBase
    {
        private readonly IAiReadabilityService _aiReadabilityService;

        public AiReadabilityApiController(IAiReadabilityService aiReadabilityService)
        {
            _aiReadabilityService = aiReadabilityService;
        }

        /// <summary>
        /// Analyses the supplied rich text HTML for readability (WCAG 2.2 SC 3.1.5)
        /// and returns an improved version with an explanation of the changes.
        /// When the Umbraco.AI add-on is not installed, returns available: false.
        /// </summary>
        /// <returns code="200">The AI readability analysis result</returns>
        [HttpPost("ai/readability")]
        [ProducesResponseType<AiReadabilityResponse>(200)]
        public async Task<AiReadabilityResponse> Readability([FromBody] AiReadabilityRequest request, CancellationToken cancellationToken)
        {
            return await _aiReadabilityService.AnalyseReadabilityAsync(request, cancellationToken);
        }
    }
}
