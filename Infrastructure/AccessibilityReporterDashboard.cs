using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.Dashboards;
using Umbraco.Cms.Core;
using System;

namespace AccessibilityReporter.Infrastructure
{
    [Weight(50)]
    public class AccessibilityReporterDashboard : IDashboard
    {
        public string Alias => "accessibilityDashboard";

        public string[] Sections => new[]
        {
            Constants.Applications.Content
        };

        public string View => "/App_Plugins/AccessibilityReporter/accessibility-reporter-dashboard.html";

		// TODO: Jack restrict to groups from the config
        public IAccessRule[] AccessRules => Array.Empty<IAccessRule>();
       
    }
}