using AccessibilityReporter.Infrastructure.Config;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;

namespace AccessibilityReporter.Infrastructure
{

	internal class AccessibilityReporterComposer : IComposer
	{
		public void Compose(IUmbracoBuilder builder)
		{
			builder.Services.AddSingleton(
				AccessibilityReporterSettingsFactory.Make(
					builder.Config.GetSection(AccessibilityReporterAppSettings.SectionName)
						.Get<AccessibilityReporterAppSettings>()));

			builder.AddContentApp<AccessibilityReporterFactory>();
		}
	}
}
