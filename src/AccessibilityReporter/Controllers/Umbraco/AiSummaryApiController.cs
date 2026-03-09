using AccessibilityReporter.Core.Interfaces;
using AccessibilityReporter.Core.Models;
using Asp.Versioning;
using Microsoft.AspNetCore.Mvc;
using System.Threading;
using System.Threading.Tasks;

namespace AccessibilityReporter.Controllers.Umbraco
{
    [ApiVersion("1.0")]
    [ApiExplorerSettings(GroupName = "AiSummary")]
    public class AiSummaryApiController : AccessibilityReporterControllerBase
    {
        private readonly IAiReportSummaryService _aiSummaryService;

        public AiSummaryApiController(IAiReportSummaryService aiSummaryService)
        {
            _aiSummaryService = aiSummaryService;
        }

        /// <summary>
        /// Returns an AI-generated plain-text summary of the supplied accessibility report.
        /// When the Umbraco.AI add-on is not installed, returns available: false.
        /// </summary>
        /// <returns code="200">The AI summary result</returns>
        [HttpPost("ai/summary")]
        [ProducesResponseType<AiSummaryResponse>(200)]
        public async Task<AiSummaryResponse> Summary([FromBody] AiSummaryRequest request, CancellationToken cancellationToken)
        {
            return await _aiSummaryService.GetSummaryAsync(request, cancellationToken);
        }
    }
}
