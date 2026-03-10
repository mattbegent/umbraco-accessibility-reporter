using AccessibilityReporter.Core.Interfaces;
using AccessibilityReporter.Core.Models;
using Microsoft.Extensions.AI;
using Microsoft.Extensions.Logging;
using System.Linq;
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

        public async Task<AiSummaryResponse> GetSiteSummaryAsync(AiSiteSummaryRequest request, CancellationToken cancellationToken = default)
        {
            try
            {
                var messages = new List<ChatMessage>
                {
                    new(ChatRole.System, "You are an accessibility expert helping content editors understand and fix accessibility issues across a website. Be concise, practical and friendly. Format your response in markdown, with short paragraphs and bullet points where appropriate. Your response is being used to help generate a site-wide accessibility summary for a content editor, so focus on trends, recurring issues across multiple pages and prioritised actions. Do not include any information about how you generated the summary or what data points you used; just provide the summary itself. Do not ask questions of the user."),
                    new(ChatRole.User, BuildSitePrompt(request))
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
                _logger.LogError(ex, "Error generating AI site-wide accessibility summary");

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

        private static string BuildSitePrompt(AiSiteSummaryRequest request)
        {
            var sb = new StringBuilder();

            sb.AppendLine($"Provide a site-wide accessibility summary for a website with {request.TotalPages} pages tested.");
            sb.AppendLine();
            sb.AppendLine($"Average accessibility score: {request.AverageScore}/100");
            sb.AppendLine($"Total violations across all pages: {request.TotalViolations}");

            if (request.Pages.Count > 0)
            {
                sb.AppendLine();
                sb.AppendLine("Pages by accessibility score (lowest first):");
                var sortedPages = request.Pages.OrderBy(p => p.Score).ToList();
                foreach (var page in sortedPages)
                {
                    sb.AppendLine($"- \"{page.Name}\" ({page.Url}): score {page.Score}/100, {page.ViolationCount} failed test(s)");
                }
            }

            if (request.MostCommonViolations.Count > 0)
            {
                sb.AppendLine();
                sb.AppendLine("Most common violations across the site:");
                foreach (var violation in request.MostCommonViolations)
                {
                    var pageWord = violation.AffectedPages == 1 ? "page" : "pages";
                    sb.AppendLine($"- {violation.Impact.ToUpperInvariant()}: {violation.Help} ({violation.TotalOccurrences} total occurrence(s) across {violation.AffectedPages} {pageWord})");
                }
            }

            sb.AppendLine();
            sb.AppendLine("Summarise the overall accessibility health of the website. Identify trends and recurring issues that appear across multiple pages. List the top 3–5 prioritised actions to improve site-wide accessibility. Note which pages need the most urgent attention. Write for a content editor, not a developer.");

            return sb.ToString();
        }
    }
}
