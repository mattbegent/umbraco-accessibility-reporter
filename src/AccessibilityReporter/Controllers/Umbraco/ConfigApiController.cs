using AccessibilityReporter.Core.Interfaces;
using Asp.Versioning;
using Microsoft.AspNetCore.Mvc;

namespace AccessibilityReporter.Controllers.Umbraco
{
    [ApiVersion("1.0")]
    [ApiExplorerSettings(GroupName = "Config")]
    public class ConfigApiController : AccessibilityReporterControllerBase
    {
        private IAccessibilityReporterSettings _settings;

        public ConfigApiController(IAccessibilityReporterSettings settings)
        {
            _settings = settings;
        }

        /// <summary>
        /// Returns the settings for Accessibility Reporter
        /// </summary>
        /// <returns code="200">The Accessibility Reporter Settings</returns>
        [HttpGet("config/current")]
        [ProducesResponseType<IAccessibilityReporterSettings>(200)]
        public IAccessibilityReporterSettings Current()
        {
            return _settings;
        }
    }
}
