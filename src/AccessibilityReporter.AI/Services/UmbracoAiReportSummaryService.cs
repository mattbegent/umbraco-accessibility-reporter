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
                    new(ChatRole.System, "You are an accessibility expert helping content editors understand and fix accessibility issues on web pages. Be concise, practical and friendly. Format your response in markdown, with short paragraphs and bullet points where appropriate. Use bold sparingly — only for category labels, not for general emphasis. Your response is being used to help generate an accessibility summary for a content editor, so focus on the most important issues and most actionable advice. Do not include any information about how you generated the summary or what data points you used; just provide the summary itself. Do not ask questions of the user. Do not start with a title or heading — jump straight into the content."),
                    new(ChatRole.User, BuildPagePrompt(request))
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
                    new(ChatRole.System, "You are an accessibility expert helping content editors understand and fix accessibility issues across a website. Be concise, practical and friendly. Do not start with a title or heading — jump straight into the content. Format your response in markdown, with short paragraphs and bullet points where appropriate. Your response is being used to help generate a site-wide accessibility summary for a content editor, so focus on trends, recurring issues across multiple pages and prioritised actions. Do not include any information about how you generated the summary or what data points you used; just provide the summary itself. Do not ask questions of the user."),
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

        private static string BuildPagePrompt(AiSummaryRequest request)
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
            sb.AppendLine("Summarise the overall accessibility health of this webpage in 2 sentences.");
            sb.AppendLine("If the webpage is accessible, celebrate this with the user. Use positive language and highlight what is working well on the page. Include emojis to make it more friendly and engaging.");
            sb.AppendLine("If there are issues, identify the most important ones to fix and provide actionable advice on how to fix them. Focus on the most impactful improvements that would make the biggest difference to users. Prioritise fixes that content editors can do themselves over those that require developer involvement.");
            sb.AppendLine("Categorise the issues into two groups. One group for issues that content editors can fix themselves (e.g. meaningful alt text, clear link text, logical heading structure, sensible reading order etc.) and another group for issues that would require developer involvement (e.g. ARIA roles, keyboard focus management, dynamic content updates etc.). Use bold for the category labels but not for general emphasis in the advice.");
            sb.AppendLine("Prioritise the highest-impact issues in each category. Use bullet points. Keep each bullet to one short sentence. Have a maximum of 3 bullets points.");


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
4. **Technical information about this website's accessibility** - Commitment statement and compliance status
5. **Non-accessible content** - Detailed list of non-compliances from the audit data, with WCAG criteria references where possible
6. **What we're doing to improve accessibility** - Placeholder for improvement plans
7. **Preparation of this accessibility statement** - Statement preparation details with today's date

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

        public async Task<AiSummaryResponse> GetManualTestsAsync(AiManualTestsRequest request, CancellationToken cancellationToken = default)
        {
            try
            {
                var messages = new List<ChatMessage>
                {
                    new(ChatRole.System, BuildManualTestsSystemPrompt()),
                    new(ChatRole.User, BuildManualTestsPrompt(request))
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
                _logger.LogError(ex, "Error generating AI manual tests for page {PageUrl}", request.PageUrl);

                return new AiSummaryResponse
                {
                    Available = true,
                    Summary = null
                };
            }
        }

        private static string BuildManualTestsSystemPrompt()
        {
            return @"You are an accessibility expert who generates tailored manual accessibility test checklists for web pages. Your role is to analyse the HTML content of a page and its automated test results to produce specific, actionable manual tests that are relevant to the actual content and elements on the page. You will also review a set of existing default tests and identify any that are NOT relevant to the page.

Important rules:
- Each test must be a verification check only — it must ask the user to TEST or VERIFY something, never to FIX, ADD, REMOVE, CHANGE or REPLACE anything. For example, write ""Verify that the page has a lang attribute set to the correct language"" NOT ""Add a lang attribute to the html element and verify it is correct""
- Each test must be a single clear sentence that a content editor can understand and act on
- Tests should be specific to the page content — reference actual elements, features or content patterns you can see in the HTML
- Categories should be one of: ""Keyboard"", ""Visual"", ""Screen Reader"", ""Content"", ""Forms"", ""Media"", ""Navigation"", ""Interactive""
- Include 10–20 new tests, prioritising the most important ones based on what you see in the HTML
- Do not include tests that automated tools would have already caught (e.g. missing alt text, colour contrast ratios)
- Focus on things that require human judgement: meaningful alt text, logical reading order, clear link purpose, sensible focus management, appropriate use of headings, video captions etc.
- CRITICAL: Format your response as a JSON object with two properties:
  - ""excludeDefaults"": an array of strings — the exact text of any default tests that are NOT relevant to this page (e.g. media tests when there is no media on the page, form tests when there are no forms). Only exclude tests for features clearly absent from the page. Use an empty array if all default tests are relevant.
  - ""tests"": an array of objects, each with a ""test"" (string) and ""category"" (string) property — these are the NEW tailored tests
- CRITICAL: Do not wrap the JSON in markdown code fences or backticks. Do not start with ```json or ```. Output ONLY the raw JSON object starting with { and ending with }
- Do not include any commentary, explanation or text before or after the JSON object";
        }

        private static string BuildManualTestsPrompt(AiManualTestsRequest request)
        {
            var sb = new StringBuilder();

            sb.AppendLine($"Generate tailored manual accessibility tests for the page \"{request.PageName}\" ({request.PageUrl}).");
            sb.AppendLine();
            sb.AppendLine($"Accessibility score: {request.Score}/100");
            sb.AppendLine($"Automated violations found: {request.Violations.Count}");
            sb.AppendLine($"Incomplete automated tests: {request.IncompleteCount}");

            if (request.Violations.Count > 0)
            {
                sb.AppendLine();
                sb.AppendLine("Automated violations detected:");
                foreach (var violation in request.Violations)
                {
                    var nodeWord = violation.NodeCount == 1 ? "element" : "elements";
                    sb.AppendLine($"- {violation.Impact.ToUpperInvariant()}: {violation.Help} ({violation.NodeCount} {nodeWord})");
                }
            }

            // Truncate HTML to avoid exceeding token limits — first 15 000 characters is enough for context
            var html = request.PageHtml;
            if (html.Length > 15000)
            {
                html = html.Substring(0, 15000) + "\n[... HTML truncated ...]";
            }

            sb.AppendLine();
            sb.AppendLine("Page HTML:");
            sb.AppendLine(html);

            if (request.DefaultTests.Count > 0)
            {
                sb.AppendLine();
                sb.AppendLine("Default manual tests already shown to the user (identify any that are NOT relevant to this page):");
                foreach (var test in request.DefaultTests)
                {
                    sb.AppendLine($"- {test}");
                }
            }

            return sb.ToString();
        }

        public async Task<AiSummaryResponse> GetHistorySummaryAsync(AiHistorySummaryRequest request, CancellationToken cancellationToken = default)
        {
            try
            {
                var messages = new List<ChatMessage>
                {
                    new(ChatRole.System, "You are an accessibility expert helping content editors understand how the accessibility of a web page has changed over time. Be concise, practical and friendly. Do not start with a title or heading — jump straight into the content. Format your response in markdown, with short paragraphs and bullet points where appropriate. Focus on trends (positive or negative), highlight any issues that appear repeatedly across runs, and suggest prioritised next steps. Do not include any information about how you generated the summary or what data points you used; just provide the summary itself. Do not ask questions of the user."),
                    new(ChatRole.User, BuildHistoryPrompt(request))
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
                _logger.LogError(ex, "Error generating AI history summary for page {PageUrl}", request.PageUrl);

                return new AiSummaryResponse
                {
                    Available = true,
                    Summary = null
                };
            }
        }

        private static string BuildHistoryPrompt(AiHistorySummaryRequest request)
        {
            var sb = new StringBuilder();

            sb.AppendLine($"Provide a trend summary for the accessibility history of the page \"{request.PageName}\" ({request.PageUrl}).");
            sb.AppendLine();
            sb.AppendLine($"The following {request.Runs.Count} test run(s) have been recorded (oldest first):");

            foreach (var run in request.Runs)
            {
                sb.AppendLine($"- {run.RunDate}: score {run.Score}/100, {run.FailedCount} failed, {run.IncompleteCount} incomplete, {run.PassedCount} passed");
            }

            if (request.FrequentViolations.Count > 0)
            {
                sb.AppendLine();
                sb.AppendLine("Issues that appear repeatedly across runs:");
                foreach (var v in request.FrequentViolations)
                {
                    var runWord = v.AppearanceCount == 1 ? "run" : "runs";
                    sb.AppendLine($"- {v.Impact.ToUpperInvariant()}: {v.Help} (appeared in {v.AppearanceCount} {runWord})");
                }
            }

            sb.AppendLine();
            sb.AppendLine("Summarise the accessibility trend for this page. Has it improved, worsened or stayed the same? Highlight any persistent issues that keep appearing across multiple runs. Suggest the most important next steps. Keep the response concise — 2–3 short paragraphs or equivalent bullet points.");

            return sb.ToString();
        }
    }
}
