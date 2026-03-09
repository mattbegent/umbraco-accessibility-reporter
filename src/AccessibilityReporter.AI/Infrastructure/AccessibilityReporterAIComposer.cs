using AccessibilityReporter.AI.Services;
using AccessibilityReporter.Core.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;

namespace AccessibilityReporter.AI.Infrastructure
{
    /// <summary>
    /// Registers the Umbraco.AI-backed implementation of IAiReportSummaryService,
    /// replacing the no-op registered by the core Accessibility Reporter package.
    /// </summary>
    public class AccessibilityReporterAIComposer : IComposer
    {
        public void Compose(IUmbracoBuilder builder)
        {
            // AddSingleton (not TryAddSingleton) so that this registration takes
            // precedence over the no-op registered by AccessibilityReporterComposer.
            // ASP.NET Core DI returns the last-registered implementation for GetService<T>.
            builder.Services.AddSingleton<IAiReportSummaryService, UmbracoAiReportSummaryService>();
        }
    }
}
