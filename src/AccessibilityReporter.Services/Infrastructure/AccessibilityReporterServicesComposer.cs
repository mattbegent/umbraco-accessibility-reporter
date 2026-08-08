using AccessibilityReporter.Core.Interfaces;
using AccessibilityReporter.Services.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;

namespace AccessibilityReporter.Services.Infrastructure
{
	internal class AccessibilityReporterServicesComposer : IComposer
	{
		public void Compose(IUmbracoBuilder builder)
		{
			builder.Services.AddScoped<ITestableNodesService, DefaultTestableNodesService>();
			builder.Services.AddScoped<ITestableNodesSummaryService, TestableNodesSummaryService>();
			builder.Services.AddScoped<INodeUrlService, NodeUrlService>();
			builder.Services.AddScoped<ITestRunMapperService, TestRunV1MapperService>();
			builder.Services.AddScoped<ITestRunService, TestRunService>();
			builder.Services.AddScoped<IContentRootResolverService, ContentRootResolverService>();
			builder.Services.AddScoped<ISiteHistoryService, SiteHistoryService>();
		}
	}
}
