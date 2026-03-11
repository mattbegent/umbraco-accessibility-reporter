using AccessibilityReporter.AI.Services;
using AccessibilityReporter.Core.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;

namespace AccessibilityReporter.AI.Infrastructure
{
    /// <summary>
    /// Registers the Umbraco.AI-backed implementations of AI services,
    /// replacing the no-ops registered by the core Accessibility Reporter package.
    /// </summary>
    public class AccessibilityReporterAIComposer : IComposer
    {
        public void Compose(IUmbracoBuilder builder)
        {
            // AddSingleton (not TryAddSingleton) so that these registrations take
            // precedence over the no-ops registered by AccessibilityReporterComposer.
            // ASP.NET Core DI returns the last-registered implementation for GetService<T>.
            builder.Services.AddSingleton<IAiReportSummaryService, UmbracoAiReportSummaryService>();
            builder.Services.AddSingleton<IAiReadabilityService, UmbracoAiReadabilityService>();
        }
    }
}
