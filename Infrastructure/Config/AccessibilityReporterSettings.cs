using Newtonsoft.Json;
using System.Collections.Generic;

namespace AccessibilityReporter.Infrastructure.Config
{
    public class AccessibilityReporterSettings
    {
        public AccessibilityReporterSettings()
        {
            UserGroups = new HashSet<string>() { "admin" };
        }

        [JsonIgnore]
        public static string SectionName = "AccessibilityReporter";

        public string ApiUrl { get; set; } = string.Empty;

        public string TestBaseUrl { get; set; } = string.Empty;

        public bool RunTestsAutomatically { get; set; }

        public HashSet<string> UserGroups { get; set; }
    }
}
