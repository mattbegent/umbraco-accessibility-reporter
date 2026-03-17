using AccessibilityReporter.Core.Interfaces;
using AccessibilityReporter.Core.Models;
using Microsoft.Extensions.AI;
using Microsoft.Extensions.Logging;
using Umbraco.AI.Core.Chat;

namespace AccessibilityReporter.AI.Services
{
    internal class UmbracoAiReadabilityService : IAiReadabilityService
    {
        private readonly IAIChatService _chatService;
        private readonly ILogger<UmbracoAiReadabilityService> _logger;

        private const string SystemPrompt =
            """
            You are an accessibility and plain-language expert. Your task is to rewrite
            HTML content so it meets WCAG 2.1 Success Criterion 3.1.5 (Reading Level,
            Level AAA). The goal is that the text can be understood by someone with a
            lower secondary education reading level (roughly 7-9 years of schooling).

            Rules you MUST follow:
            - Use short, common words. Replace jargon or technical terms with simpler
              alternatives, or add a brief inline explanation.
            - Use short sentences (ideally under 20 words each).
            - Use active voice instead of passive voice.
            - Break long paragraphs into smaller ones.
            - Use bullet or numbered lists where appropriate to aid scanning.
            - Preserve ALL original HTML tags, attributes, links, images and structure.
              Only change the text content itself. Do not remove or add HTML elements
              unless splitting a paragraph into a list or shorter paragraphs.
            - Do not change proper nouns, names, or titles.
            - Keep the same overall meaning; do not add or remove information.
            - Return ONLY the rewritten HTML fragment. No wrapping ```html``` code fences,
              no commentary. Just the HTML.
            """;

        public UmbracoAiReadabilityService(IAIChatService chatService, ILogger<UmbracoAiReadabilityService> logger)
        {
            _chatService = chatService;
            _logger = logger;
        }

        public bool IsAvailable => true;

        public async Task<AiReadabilityResponse> AnalyseReadabilityAsync(AiReadabilityRequest request, CancellationToken cancellationToken = default)
        {
            try
            {
                // Step 1: Rewrite for readability
                var rewriteMessages = new List<ChatMessage>
                {
                    new(ChatRole.System, SystemPrompt),
                    new(ChatRole.User, $"Rewrite the following HTML content to improve its readability:\n\n{request.Html}")
                };

                var rewriteResponse = await _chatService.GetChatResponseAsync(rewriteMessages, cancellationToken: cancellationToken);
                var improvedHtml = rewriteResponse.Text?.Trim();

                if (string.IsNullOrWhiteSpace(improvedHtml))
                {
                    return new AiReadabilityResponse { Available = true };
                }

                // Step 2: Ask for a summary of changes
                var explainMessages = new List<ChatMessage>
                {
                    new(ChatRole.System,
                        "You are an accessibility expert. Given an original and a rewritten version of HTML content, " +
                        "provide a concise bullet-point summary (in markdown) of the readability improvements that were made. " +
                        "Start with a markdown heading level 2 (##) that says only 'Readability Improvements'. " +
                        "Then provide a maximum of 3 bullet points explaining the most impactful changes. Each bullet point must be ONE SHORT SENTENCE (max 20 words)." +
                        "Keep it brief, clear, and easy to understand. " +
                        "Focus on what changed and why it helps, not what stayed the same." +
                        "End with a short summary sentence explaining how the improvements will help users."),
                    new(ChatRole.User,
                        $"Original HTML:\n{request.Html}\n\nImproved HTML:\n{improvedHtml}")
                };

                var explainResponse = await _chatService.GetChatResponseAsync(explainMessages, cancellationToken: cancellationToken);

                return new AiReadabilityResponse
                {
                    Available = true,
                    ImprovedHtml = improvedHtml,
                    Explanation = explainResponse.Text?.Trim()
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating AI readability improvements");

                return new AiReadabilityResponse
                {
                    Available = true,
                    ImprovedHtml = null,
                    Explanation = null
                };
            }
        }
    }
}
