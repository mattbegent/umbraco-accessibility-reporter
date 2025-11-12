using AccessibilityReporter.Core.Interfaces.Data;
using NPoco;
using Umbraco.Cms.Infrastructure.Persistence.DatabaseAnnotations;

namespace AccessibilityReporter.Database.Data.Models
{
    [TableName($"AccessibilityReporter{nameof(TestRunData)}")]
    [PrimaryKey(nameof(Id), AutoIncrement = true)]
    public class TestRunData : ITestRunData
    {
        [Ignore]
        public static string TableName => $"AccessibilityReporter{nameof(TestRunData)}";

        [Column("Id")]
        [PrimaryKeyColumn(AutoIncrement = true, IdentitySeed = 1)]
        public int Id { get; set; }

        public Guid ContentId { get; set; }

        public DateTime RunCompleted { get; set; }

        public string ResultPayload { get; set; } = string.Empty;

        public int ResultPayloadVersion { get; set; } = 1;
    }
}
