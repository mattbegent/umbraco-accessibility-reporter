using AccessibilityReporter.Infrastructure.Config;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;

namespace AccessibilityReporter.Infrastructure
{

	internal class AccessibilityReporterComposer : IComposer
	{
		public void Compose(IUmbracoBuilder builder)
		{
			builder.Services.AddOptions<AccessibilityReporterAppSettings>()
				.Bind(builder.Config.GetSection(AccessibilityReporterAppSettings.SectionName));

			builder.AddContentApp<AccessibilityReporterFactory>();
		}
	}
}
