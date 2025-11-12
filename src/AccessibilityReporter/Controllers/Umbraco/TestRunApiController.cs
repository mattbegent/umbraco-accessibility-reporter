using AccessibilityReporter.Core.Models;
using AccessibilityReporter.Services.Interfaces;
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
        [HttpGet("test-runs/{contentId}")]
        [ProducesResponseType<IEnumerable<TestRun>>(200)]
        public IEnumerable<TestRun> Runs(Guid contentId)
            => _testRunService.Runs(contentId);

        /// <summary>
        /// Creates a test run instance
        /// </summary>
        /// <returns code="201">Successful creation of a test run</returns>
        [HttpPost("test-run/{contentId}")]
        [ProducesResponseType(201)]
        public IActionResult Create(Guid contentId, [FromBody] string testResultPayload)
        {
            _testRunService.Create(contentId, testResultPayload);

            return Created();
        }
    }
}
