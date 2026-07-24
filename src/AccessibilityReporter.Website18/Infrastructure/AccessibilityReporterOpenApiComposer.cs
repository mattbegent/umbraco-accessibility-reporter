using Umbraco.Cms.Api.Common.OpenApi;
using Umbraco.Cms.Api.Management.OpenApi;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;

namespace AccessibilityReporter.Website18.Infrastructure
{
    // Development-only composer for the Umbraco 18 test site. Registers the
    // "AccessibilityReporter" OpenAPI document (matching the [MapToApi] attribute on the
    // package controllers) so the API can be browsed at /umbraco/openapi.
    // This is the Umbraco 18 equivalent of the Swashbuckle-based composer in
    // AccessibilityReporter.Website (Umbraco 17). It stays out of the shipped package so
    // one package version can run on both majors.
    public class AccessibilityReporterOpenApiComposer : IComposer
    {
        public void Compose(IUmbracoBuilder builder)
            => builder.AddBackOfficeOpenApiDocument(
                "AccessibilityReporter",
                document => document
                    .WithTitle("Accessibility Reporter Package API")
                    .WithBackOfficeAuthentication());
    }
}
