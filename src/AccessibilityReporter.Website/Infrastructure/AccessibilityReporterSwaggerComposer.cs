using Microsoft.Extensions.DependencyInjection;
using Microsoft.OpenApi;
using Swashbuckle.AspNetCore.SwaggerGen;
using Umbraco.Cms.Api.Management.OpenApi;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;

namespace AccessibilityReporter.Website.Infrastructure
{
    // Development-only composer. This registers the "AccessibilityReporter" Swagger document
    // used to browse the package API via Swagger UI and to generate the TypeScript client
    // (see the openapi-ts script in src/AccessibilityReporter/client/package.json).
    // It lives in the website project rather than the package so the shipped package has no
    // Swashbuckle dependency: Umbraco 17 uses Swashbuckle, Umbraco 18 uses
    // Microsoft.AspNetCore.OpenApi, and keeping this out of the package lets one package
    // version run on both. If this website project is upgraded to Umbraco 18, replace this
    // with builder.Services.AddBackOfficeOpenApiDocument("AccessibilityReporter", ...).
    public class AccessibilityReporterSwaggerComposer : IComposer
    {
        public void Compose(IUmbracoBuilder builder)
        {
            builder.Services.Configure<SwaggerGenOptions>(opt =>
            {
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
