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

        public async Task<AiSummaryResponse> GetAccessibilityStatementAsync(AiAccessibilityStatementRequest request, CancellationToken cancellationToken = default)
        {
            try
            {
                var messages = new List<ChatMessage>
                {
                    new(ChatRole.System, BuildAccessibilityStatementSystemPrompt()),
                    new(ChatRole.User, BuildAccessibilityStatementPrompt(request))
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
                _logger.LogError(ex, "Error generating AI accessibility statement");

                return new AiSummaryResponse
                {
                    Available = true,
                    Summary = null
                };
            }
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

        private static string BuildAccessibilityStatementSystemPrompt()
        {
            return @"You are an accessibility expert who generates accessibility statements for websites. You must generate an accessibility statement following the GOV.UK template structure. The statement should be in markdown format.

The statement must follow this exact structure:

1. **Accessibility statement for [website name]** - Introduction section explaining the scope and what users should be able to do
2. **How accessible this website is** - Summary of known accessibility issues based on the audit data
3. **Feedback and contact information** - Placeholder section for contact details
4. **Enforcement procedure** - Standard legal text about EHRC/EASS
5. **Technical information about this website's accessibility** - Commitment statement and compliance status
6. **Non-accessible content** - Detailed list of non-compliances from the audit data, with WCAG criteria references where possible
7. **What we're doing to improve accessibility** - Placeholder for improvement plans
8. **Preparation of this accessibility statement** - Statement preparation details with today's date

Important rules:
- Use the actual audit data provided to populate the 'How accessible this website is' and 'Non-accessible content' sections with real issues found
- Where sections need organisation-specific information (contact details, dates for fixes etc.), use square bracket placeholders like [email address], [phone number] etc.
- The compliance status should be determined from the audit data: if there are violations, the site is partially compliant or not compliant
- Reference WCAG 2.2 AA standard throughout
- Format the entire response in clean markdown
- Do not include any commentary or instructions about the statement itself, just output the statement content
- Do not ask questions of the user";
        }

        private static string BuildAccessibilityStatementPrompt(AiAccessibilityStatementRequest request)
        {
            var sb = new StringBuilder();

            sb.AppendLine($"Generate an accessibility statement for the website \"{request.WebsiteName}\" ({request.WebsiteUrl}), run by \"{request.OrganisationName}\".");
            sb.AppendLine();
            sb.AppendLine($"The website was tested using automated accessibility testing tools. Here are the results:");
            sb.AppendLine();
            sb.AppendLine($"- Total pages tested: {request.TotalPages}");
            sb.AppendLine($"- Average accessibility score: {request.AverageScore}/100");
            sb.AppendLine($"- Total violations found: {request.TotalViolations}");

            if (request.Pages.Count > 0)
            {
                sb.AppendLine();
                sb.AppendLine("Pages tested (sorted by score, lowest first):");
                var sortedPages = request.Pages.OrderBy(p => p.Score).ToList();
                foreach (var page in sortedPages)
                {
                    sb.AppendLine($"- \"{page.Name}\" ({page.Url}): score {page.Score}/100, {page.ViolationCount} violation(s)");
                }
            }

            if (request.MostCommonViolations.Count > 0)
            {
                sb.AppendLine();
                sb.AppendLine("Accessibility violations found:");
                foreach (var violation in request.MostCommonViolations)
                {
                    var pageWord = violation.AffectedPages == 1 ? "page" : "pages";
                    sb.AppendLine($"- {violation.Impact.ToUpperInvariant()}: {violation.Help} (axe rule: {violation.Id}, {violation.TotalOccurrences} occurrence(s) across {violation.AffectedPages} {pageWord})");
                }
            }

            sb.AppendLine();
            sb.AppendLine($"Today's date is {DateTime.UtcNow:d MMMM yyyy}. Use this as the preparation date for the statement.");

            return sb.ToString();
        }
    }
}
