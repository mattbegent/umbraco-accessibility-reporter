using AccessibilityReporter.Infrastructure.Config;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using System.Text.Json;
using Umbraco.Cms.Web.BackOffice.Controllers;

namespace AccessibilityReporter.Controllers
{
    public class ConfigController : UmbracoAuthorizedApiController
    {
        private readonly IOptions<AccessibilityReporterSettings> _accessibilityReporterOptions;

        public ConfigController(IOptions<AccessibilityReporterSettings> accessibilityReporterOptions)
        {
            _accessibilityReporterOptions = accessibilityReporterOptions;
        }

        [HttpGet]
        public JsonResult Current()
            => new JsonResult(_accessibilityReporterOptions.Value, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            });
    }
}
