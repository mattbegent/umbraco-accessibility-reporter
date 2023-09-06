using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.Dashboards;
using Umbraco.Cms.Core;
using System.Linq;
using AccessibilityReporter.Core.Interfaces;

namespace AccessibilityReporter.Infrastructure
{
    [Weight(50)]
    public class AccessibilityReporterDashboard : IDashboard
    {
		private readonly IAccessibilityReporterSettings _settings;

		public AccessibilityReporterDashboard(IAccessibilityReporterSettings settings)
        {
            _settings = settings;
        }

        public string Alias => "accessibilityDashboard";

        public string[] Sections => new[]
        {
            Constants.Applications.Content
        };

        public string View => "/App_Plugins/AccessibilityReporter/accessibility-reporter-dashboard.html";

        public IAccessRule[] AccessRules => _settings.UserGroups
            .Select(userGroup => new AccessRule 
            { 
                Type = AccessRuleType.Grant,
                Value = userGroup
            })
            .ToArray();
       
    }
}