using System.Text.Json;
using AccessibilityReporter.Core.Interfaces.Data;
using AccessibilityReporter.Core.Models;
using AccessibilityReporter.Services.Interfaces;

namespace AccessibilityReporter.Services
{
    internal class TestRunV1MapperService : ITestRunMapperService
    {
        public int ApplicableVersion => 1;

        public TestRun Map(ITestRunData testRunData)
        {
            int failedCount = 0;
            int passedCount = 0;
            int incompleteCount = 0;
            int score = 100;

            if (!string.IsNullOrEmpty(testRunData.ResultPayload))
            {
                using var doc = JsonDocument.Parse(testRunData.ResultPayload);
                var root = doc.RootElement;

                if (root.TryGetProperty("violations", out var violations))
                {
                    failedCount = violations.GetArrayLength();
                    foreach (var violation in violations.EnumerateArray())
                    {
                        if (violation.TryGetProperty("id", out var id))
                        {
                            score -= GetRuleWeight(id.GetString() ?? string.Empty);
                        }
                    }
                    score = Math.Max(0, score);
                }

                if (root.TryGetProperty("passes", out var passes))
                {
                    passedCount = passes.GetArrayLength();
                }

                if (root.TryGetProperty("incomplete", out var incomplete))
                {
                    incompleteCount = incomplete.GetArrayLength();
                }
            }

            return new TestRun
            {
                ContentId = testRunData.ContentId,
                RunCompleted = testRunData.RunCompleted,
                Score = score,
                FailedCount = failedCount,
                PassedCount = passedCount,
                IncompleteCount = incompleteCount
            };
        }

        // Weights mirror the TypeScript getRuleWeight() in accessibility-reporter.service.ts
        // Based on https://developer.chrome.com/docs/lighthouse/accessibility/scoring/
        private static int GetRuleWeight(string ruleId) => ruleId switch
        {
            "accesskeys" => 7,
            "aria-allowed-attr" => 10,
            "aria-allowed-role" => 1,
            "aria-command-name" => 7,
            "aria-dialog-name" => 7,
            "aria-hidden-body" => 10,
            "aria-hidden-focus" => 7,
            "aria-input-field-name" => 7,
            "aria-meter-name" => 7,
            "aria-progressbar-name" => 7,
            "aria-required-attr" => 10,
            "aria-required-children" => 10,
            "aria-required-parent" => 10,
            "aria-roles" => 7,
            "aria-text" => 7,
            "aria-toggle-field-name" => 7,
            "aria-tooltip-name" => 7,
            "aria-treeitem-name" => 7,
            "aria-valid-attr-value" => 10,
            "aria-valid-attr" => 10,
            "button-name" => 10,
            "bypass" => 7,
            "color-contrast" => 7,
            "definition-list" => 7,
            "dlitem" => 7,
            "document-title" => 7,
            "duplicate-id-active" => 7,
            "duplicate-id-aria" => 10,
            "form-field-multiple-labels" => 3,
            "frame-title" => 7,
            "heading-order" => 3,
            "html-has-lang" => 7,
            "html-lang-valid" => 7,
            "html-xml-lang-mismatch" => 3,
            "image-alt" => 10,
            "image-redundant-alt" => 1,
            "input-button-name" => 10,
            "input-image-alt" => 10,
            "label-content-name-mismatch" => 7,
            "label" => 7,
            "link-in-text-block" => 7,
            "link-name" => 7,
            "list" => 7,
            "listitem" => 7,
            "meta-refresh" => 10,
            "meta-viewport" => 10,
            "object-alt" => 7,
            "select-name" => 7,
            "skip-link" => 3,
            "tabindex" => 7,
            "table-duplicate-name" => 1,
            "table-fake-caption" => 7,
            "td-has-header" => 10,
            "td-headers-attr" => 7,
            "th-has-data-cells" => 7,
            "valid-lang" => 7,
            "video-caption" => 10,
            _ => 0
        };
    }
}
