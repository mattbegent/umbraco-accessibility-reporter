using Newtonsoft.Json;
using System.Collections.Generic;
using System.Linq;

namespace AccessibilityReporter.Infrastructure.Config
{
    public class AccessibilityReporterSettings
    {
        [JsonIgnore]
        public static string SectionName = "AccessibilityReporter";

        public string ApiUrl { get; set; } = string.Empty;

        public string TestBaseUrl { get; set; } = string.Empty;

        public bool RunTestsAutomatically { get; set; }

        public IEnumerable<string> UserGroups { get; set; } = new List<string> { "admin" };
    }
}
