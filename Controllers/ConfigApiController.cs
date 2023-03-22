using AccessibilityReporter.Infrastructure.Config;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Web.BackOffice.Controllers;

namespace AccessibilityReporter.Controllers
{
    public class ConfigApiController : UmbracoAuthorizedApiController
	{
		private readonly AccessibilityReporterSettings _accessibilityReporterOptions;

        public ConfigApiController(AccessibilityReporterSettings accessibilityReporterOptions) 
		{
			_accessibilityReporterOptions = accessibilityReporterOptions;
		}

		[HttpGet]
		public AccessibilityReporterSettings Current()
			=> _accessibilityReporterOptions;
    }
}
