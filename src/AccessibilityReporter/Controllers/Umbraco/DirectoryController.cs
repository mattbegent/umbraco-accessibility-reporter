using AccessibilityReporter.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace AccessibilityReporter.Controllers.Umbraco
{
    public class DirectoryController : BaseUmbracoAuthorisedController
	{
        private readonly ITestableNodesSummaryService _testableNodesSummaryService;

        public DirectoryController(ITestableNodesSummaryService testableNodesSummaryService)
        {
            _testableNodesSummaryService = testableNodesSummaryService;
        }

        [HttpGet]
        public JsonResult Pages()
        {
            return Json(_testableNodesSummaryService.All());
        }
    }
}
