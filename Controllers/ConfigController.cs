using AccessibilityReporter.Infrastructure.Config;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using System.Text.Json;
using Umbraco.Cms.Web.BackOffice.Controllers;

namespace AccessibilityReporter.Controllers
{
    public class ConfigController : UmbracoAuthorizedApiController
    {
        private readonly IAccessibilityReporterSettings settings;

        public ConfigController(IAccessibilityReporterSettings accessibilityReporterOptions)
        {
            settings = accessibilityReporterOptions;
        }

        [HttpGet]
        public JsonResult Current()
            => new JsonResult(settings, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            });
    }
}
