using AccessibilityReporter.Core.Models;
using AccessibilityReporter.Services.Interfaces;
using Asp.Versioning;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;

namespace AccessibilityReporter.Controllers.Umbraco
{
    [ApiVersion("1.0")]
    [ApiExplorerSettings(GroupName = "Directory")]
    public class DirectoryApiController : AccessibilityReporterControllerBase
    {
        private ITestableNodesSummaryService _testableNodesSummaryService;

        public DirectoryApiController(ITestableNodesSummaryService testableNodesSummaryService)
        {
            _testableNodesSummaryService = testableNodesSummaryService;
        }

        /// <summary>
        /// Returns all pages
        /// </summary>
        /// <returns code="200">A collection of NodeSummary objects</returns>
        [HttpGet("pages")]
        [ProducesResponseType<IEnumerable<NodeSummary>>(200)]
        public IEnumerable<NodeSummary> Pages()
        {
            return _testableNodesSummaryService.All();
        }
    }
}
