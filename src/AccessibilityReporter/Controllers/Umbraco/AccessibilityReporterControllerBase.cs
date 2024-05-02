using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Umbraco.Cms.Api.Common.Attributes;
using Umbraco.Cms.Web.Common.Authorization;
using Umbraco.Cms.Web.Common.Routing;

namespace AccessibilityReporter.Controllers.Umbraco
{
    [ApiController]
    [BackOfficeRoute("accessibilityreporter/api/v{version:apiVersion}")]
    [Authorize(Policy = AuthorizationPolicies.SectionAccessContent)] // Can call the API if the logged in user has access to the 'content' section
    [MapToApi("AccessibilityReporter")]
    public class AccessibilityReporterControllerBase : ControllerBase
    {
    }
}
