using AccessibilityReporter.Core.Interfaces;
using AccessibilityReporter.Core.Models;
using Microsoft.Extensions.AI;
using Microsoft.Extensions.Logging;
using System.Text;
using Umbraco.AI.Core.Chat;

namespace AccessibilityReporter.AI.Services
{
    internal class UmbracoAiReportSummaryService : IAiReportSummaryService
    {
        private readonly IAIChatService _chatService;
        private readonly ILogger<UmbracoAiReportSummaryService> _logger;

        public UmbracoAiReportSummaryService(IAIChatService chatService, ILogger<UmbracoAiReportSummaryService> logger)
        {
            _chatService = chatService;
            _logger = logger;
        }

        public bool IsAvailable => true;

        public async Task<AiSummaryResponse> GetSummaryAsync(AiSummaryRequest request, CancellationToken cancellationToken = default)
        {
            try
            {
                var messages = new List<ChatMessage>
                {
                    new(ChatRole.System, "You are an accessibility expert helping content editors understand and fix accessibility issues on web pages. Be concise, practical and friendly. Format your response in markdown, with short paragraphs and bullet points where appropriate. Your response is being used to help generate an accessibility summary for a content editor, so focus on the most important issues and most actionable advice. Do not include any information about how you generated the summary or what data points you used; just provide the summary itself. Do not ask questions of the user."),
                    new(ChatRole.User, BuildPrompt(request))
                };

                var response = await _chatService.GetChatResponseAsync(messages, cancellationToken: cancellationToken);
                var summary = response.Text;

                return new AiSummaryResponse
                {
                    Available = true,
                    Summary = string.IsNullOrWhiteSpace(summary) ? null : summary
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating AI accessibility summary for page {PageUrl}", request.PageUrl);

                return new AiSummaryResponse
                {
                    Available = true,
                    Summary = null
                };
            }
        }

        private static string BuildPrompt(AiSummaryRequest request)
        {
            var sb = new StringBuilder();

            sb.AppendLine($"Provide a concise accessibility summary for the page \"{request.PageName}\" ({request.PageUrl}).");
            sb.AppendLine();
            sb.AppendLine($"Accessibility score: {request.Score}/100");
            sb.AppendLine($"Failed tests: {request.Violations.Count}");
            sb.AppendLine($"Incomplete tests (needing manual review): {request.IncompleteCount}");

            if (request.Violations.Count > 0)
            {
                sb.AppendLine();
                sb.AppendLine("Violations found:");

                foreach (var violation in request.Violations)
                {
                    var nodeWord = violation.NodeCount == 1 ? "element" : "elements";
                    sb.AppendLine($"- {violation.Impact.ToUpperInvariant()}: {violation.Help} ({violation.NodeCount} {nodeWord})");
                }
            }

            sb.AppendLine();
            sb.AppendLine("In 3–5 sentences, summarise the key accessibility issues and the most important actions to take. Prioritise the highest-impact issues. Write for a content editor, not a developer.");

            return sb.ToString();
        }
    }
}
