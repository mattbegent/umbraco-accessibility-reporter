using AccessibilityReporter.Core.Models;
using AccessibilityReporter.Services.Interfaces;
using Asp.Versioning;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;

namespace AccessibilityReporter.Controllers.Umbraco
{
    [ApiVersion("1.0")]
    [ApiExplorerSettings(GroupName = "SiteHistory")]
    public class SiteHistoryApiController : AccessibilityReporterControllerBase
    {
        private readonly ISiteHistoryService _siteHistoryService;

        public SiteHistoryApiController(ISiteHistoryService siteHistoryService)
        {
            _siteHistoryService = siteHistoryService;
        }

        /// <summary>
        /// Returns the distinct sites (root content nodes) that have test run history recorded
        /// </summary>
        /// <returns code="200">The sites with recorded history</returns>
        [HttpGet("site-history/sites")]
        [ProducesResponseType<IEnumerable<SiteSummary>>(200)]
        public IEnumerable<SiteSummary> Sites()
            => _siteHistoryService.Sites();

        /// <summary>
        /// Returns the day-by-day accessibility score trend for a site, optionally filtered by culture
        /// </summary>
        /// <returns code="200">The site's trend data points, ordered oldest to newest</returns>
        [HttpGet("site-history/{rootContentId}/trend")]
        [ProducesResponseType<IEnumerable<SiteTrendPoint>>(200)]
        public IEnumerable<SiteTrendPoint> Trend(Guid rootContentId, [FromQuery] string? culture)
            => _siteHistoryService.Trend(rootContentId, culture);
    }
}
