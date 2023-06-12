using AccessibilityReporter.Infrastructure.Config;
using Microsoft.Extensions.DependencyInjection;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;

namespace AccessibilityReporter.Infrastructure
{
    internal class AccessibilityReporterComposer : IComposer 
    {
        public void Compose(IUmbracoBuilder builder)
        {
            builder.Services.Configure<AccessibilityReporterSettings>
                (builder.Config.GetSection(AccessibilityReporterSettings.SectionName));
        }
    }
}
