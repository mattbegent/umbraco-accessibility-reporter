using AccessibilityReporter.Core.Models;
using AccessibilityReporter.Services.Interfaces;
using AccessibilityReporter.Services.Models;
using Asp.Versioning;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;

namespace AccessibilityReporter.Controllers.Umbraco
{
    [ApiVersion("1.0")]
    [ApiExplorerSettings(GroupName = "TestRun")]
    public class TestRunApiController : AccessibilityReporterControllerBase
    {
        private readonly ITestRunService _testRunService;

        public TestRunApiController(ITestRunService testRunService)
        {
            _testRunService = testRunService;
        }

        /// <summary>
        /// Returns the all previous test runs for a content item
        /// </summary>
        /// <returns code="200">The existing test run objects</returns>
        [HttpGet("test-runs/{contentId}/{culture}")]
        [ProducesResponseType<IEnumerable<TestRun>>(200)]
        public IEnumerable<TestRun> Runs(Guid contentId, string culture)
            => _testRunService.Runs(contentId, culture);

        /// <summary>
        /// Creates a test run instance
        /// </summary>
        /// <returns code="201">Successful creation of a test run</returns>
        /// <returns code="204">Creation was ignored due to matching content hash</returns>
        [HttpPost("test-run/{contentId}/{culture}/{contentHash}")]
        [ProducesResponseType(201)]
        [ProducesResponseType(204)]
        public IActionResult Create(Guid contentId, string culture, string contentHash, [FromBody] string testResultPayload)
        {
            var result = _testRunService.Create(contentId, culture, contentHash, testResultPayload);

            return result.Equals(TestRunCreationResult.Created)
                ? Created() : NoContent();
        }
    }
}
