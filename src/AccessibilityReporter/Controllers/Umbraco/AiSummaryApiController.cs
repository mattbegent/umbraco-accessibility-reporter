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

        /// <summary>
        /// Returns an AI-generated summary of the accessibility results across the whole website.
        /// When the Umbraco.AI add-on is not installed, returns available: false.
        /// </summary>
        /// <returns code="200">The AI site summary result</returns>
        [HttpPost("ai/site-summary")]
        [ProducesResponseType<AiSummaryResponse>(200)]
        public async Task<AiSummaryResponse> SiteSummary([FromBody] AiSiteSummaryRequest request, CancellationToken cancellationToken)
        {
            return await _aiSummaryService.GetSiteSummaryAsync(request, cancellationToken);
        }

        /// <summary>
        /// Returns an AI-generated accessibility statement based on the GOV.UK template,
        /// populated with data from the accessibility audit results.
        /// When the Umbraco.AI add-on is not installed, returns available: false.
        /// </summary>
        /// <returns code="200">The AI accessibility statement result</returns>
        [HttpPost("ai/accessibility-statement")]
        [ProducesResponseType<AiSummaryResponse>(200)]
        public async Task<AiSummaryResponse> AccessibilityStatement([FromBody] AiAccessibilityStatementRequest request, CancellationToken cancellationToken)
        {
            return await _aiSummaryService.GetAccessibilityStatementAsync(request, cancellationToken);
        }

        /// <summary>
        /// Returns AI-tailored manual accessibility tests based on the page content and audit results.
        /// When the Umbraco.AI add-on is not installed, returns available: false.
        /// </summary>
        /// <returns code="200">The AI manual tests result</returns>
        [HttpPost("ai/manual-tests")]
        [ProducesResponseType<AiSummaryResponse>(200)]
        public async Task<AiSummaryResponse> ManualTests([FromBody] AiManualTestsRequest request, CancellationToken cancellationToken)
        {
            return await _aiSummaryService.GetManualTestsAsync(request, cancellationToken);
        }

        /// <summary>
        /// Returns an AI-generated summary of trends and recurring issues from a page's test run history.
        /// When the Umbraco.AI add-on is not installed, returns available: false.
        /// </summary>
        /// <returns code="200">The AI history summary result</returns>
        [HttpPost("ai/history-summary")]
        [ProducesResponseType<AiSummaryResponse>(200)]
        public async Task<AiSummaryResponse> HistorySummary([FromBody] AiHistorySummaryRequest request, CancellationToken cancellationToken)
        {
            return await _aiSummaryService.GetHistorySummaryAsync(request, cancellationToken);
        }
    }
}
