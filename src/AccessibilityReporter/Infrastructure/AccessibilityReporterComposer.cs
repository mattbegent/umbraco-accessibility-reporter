using AccessibilityReporter.Infrastructure.Config;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;
using Umbraco.Cms.Api.Management.OpenApi;
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

            builder.Services.Configure<SwaggerGenOptions>(opt =>
            {
                // Configure the Swagger generation options
                // Add in a new Swagger API document solely for our own package that can be browsed via Swagger UI
                // Along with having a generated swagger JSON file that we can use to auto generate a TypeScript client
                opt.SwaggerDoc("AccessibilityReporter", new OpenApiInfo
                {
                    Title = "Accessibility Reporter Package API",
                    Version = "1.0"
                });

                // https://docs.umbraco.com/umbraco-cms/v/14.latest-beta/reference/custom-swagger-api
                // PR: https://github.com/umbraco/Umbraco-CMS/pull/15699
                opt.OperationFilter<MyBackOfficeSecurityRequirementsOperationFilter>();

                // Rather than very verbose names from generated TS client, we simplify them a bit
                // https://github.com/domaindrivendev/Swashbuckle.AspNetCore/blob/master/README.md#operation-filters
                // https://docs.umbraco.com/umbraco-cms/reference/api-versioning-and-openapi#adding-custom-operation-ids
                // https://g-mariano.medium.com/generate-readable-apis-clients-by-setting-unique-and-meaningful-operationid-in-swagger-63d404f32ff8
                opt.CustomOperationIds(apiDesc => $"{apiDesc.ActionDescriptor.RouteValues["action"]}");
            });


        }
    }

    // https://docs.umbraco.com/umbraco-cms/v/14.latest-beta/reference/custom-swagger-api
    // PR: https://github.com/umbraco/Umbraco-CMS/pull/15699
    public class MyBackOfficeSecurityRequirementsOperationFilter : BackOfficeSecurityRequirementsOperationFilterBase
    {
        protected override string ApiName => "AccessibilityReporter";
    }
}
