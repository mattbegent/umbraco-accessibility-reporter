using AccessibilityReporter.Infrastructure.Config;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using Umbraco.Cms.Web.BackOffice.Controllers;

namespace AccessibilityReporter.Controllers
{
    public class ConfigController : UmbracoAuthorizedApiController
    {
        private readonly IAccessibilityReporterSettings _settings;

        public ConfigController(IAccessibilityReporterSettings settings)
        {
            _settings = settings;
        }

        [HttpGet]
        public JsonResult Current()
            => new JsonResult(_settings, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            });
    }
}
