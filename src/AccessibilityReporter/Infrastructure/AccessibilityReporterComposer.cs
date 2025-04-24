using System.Net.Http;
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
			var config = builder.Config.GetSection(AccessibilityReporterAppSettings.SectionName)
				.Get<AccessibilityReporterAppSettings>();

			builder.Services.AddSingleton(AccessibilityReporterSettingsFactory.Make(config ?? new AccessibilityReporterAppSettings()));

            builder.Services.AddHttpClient("AccessibilityReporterProxy")
            .ConfigurePrimaryHttpMessageHandler(() => new HttpClientHandler
            {
                AllowAutoRedirect = true,
                AutomaticDecompression = System.Net.DecompressionMethods.GZip | System.Net.DecompressionMethods.Deflate,
                UseCookies = true,
                CookieContainer = new System.Net.CookieContainer()
            });

			builder.AddContentApp<AccessibilityReporterFactory>();
			builder.AddDashboard<AccessibilityReporterDashboard>();
		}
	}
}
