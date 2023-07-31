using AccessibilityReporter.Infrastructure.Config;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using System.Text.Json;
using Umbraco.Cms.Web.BackOffice.Controllers;

namespace AccessibilityReporter.Controllers
{
    public class ConfigController : UmbracoAuthorizedApiController
    {
        private readonly IOptions<AccessibilityReporterAppSettings> _settings;

        public ConfigController(IOptions<AccessibilityReporterAppSettings> settings)
        {
            _settings = settings;
        }

        [HttpGet]
        public JsonResult Current()
            => new JsonResult(_settings.Value, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            });
    }
}
