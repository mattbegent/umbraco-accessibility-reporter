using AccessibilityReporter.Core.Interfaces;
using AccessibilityReporter.Core.Models;
using Asp.Versioning;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;

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
        [ProducesResponseType<IEnumerable<NodeSummary>>(200)]
        public IAccessibilityReporterSettings Current()
        {
            return _settings;
        }
    }
}
