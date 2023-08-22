using AccessibilityReporter.Core.Interfaces;
using AccessibilityReporter.Services.Interfaces;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.Web;
using Umbraco.Extensions;

namespace AccessibilityReporter.Services
{
	public class DefaultTestableNodesService : ITestableNodesService
	{
		private readonly IUmbracoContextFactory _contextFactory;
		private readonly IVariationContextAccessor _variationContextAccessor;
		private readonly IAccessibilityReporterSettings _settings;

		public DefaultTestableNodesService(IUmbracoContextFactory contextFactory,
            IVariationContextAccessor variationContextAccessor,
			IAccessibilityReporterSettings settings)
        {
            _contextFactory = contextFactory;
            _variationContextAccessor = variationContextAccessor;
			_settings = settings;
        }

		public IEnumerable<IPublishedContent> All()
		{
			using (var contextReference = _contextFactory.EnsureUmbracoContext())
			{
				// TODO: *not this*. Perhaps use an examine search. Note - need to think about how we handle cases where ExamineX is used. 
				// This is currenttly only suitable for small sites.
				// Aside: Whatever we do here will not be suitable for everyone. We should ensure this implementation can be overriden in userspace. 
				var everything = contextReference.UmbracoContext.Content!.GetAtRoot()
					.DescendantsOrSelf<IPublishedContent>(_variationContextAccessor);

				return everything.Where(DocumentTypeIsApplicable)
					.Where(TemplateStateIsApplicable)
					.Take(_settings.MaxPages);

				bool DocumentTypeIsApplicable(IPublishedContent content)
					=> _settings.ExcludedDocTypes.Contains(content.ContentType.Alias) == false;

				bool TemplateStateIsApplicable(IPublishedContent content)
					=> _settings.IncludeIfNoTemplate || content.TemplateId.HasValue;
			}
		}
	}
}
