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

			// NOTE: No OpenAPI/Swagger document is registered here on purpose.
			// Umbraco 17 uses Swashbuckle while Umbraco 18 uses Microsoft.AspNetCore.OpenApi,
			// so registering a document in the package would tie it to a single major version.
			// The document used to generate the TypeScript client lives in the
			// AccessibilityReporter.Website development project instead.
		}
	}
}
