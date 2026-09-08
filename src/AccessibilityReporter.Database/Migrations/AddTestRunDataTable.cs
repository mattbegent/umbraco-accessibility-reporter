using AccessibilityReporter.Database.Data.Models;
using Microsoft.Extensions.Logging;
using Umbraco.Cms.Infrastructure.Migrations;

namespace AccessibilityReporter.Database.Migrations
{
    internal class AddTestRunDataTable : AsyncMigrationBase
    {
        public AddTestRunDataTable(IMigrationContext context)
            : base(context)
        { }

        protected override Task MigrateAsync()
        {
            Logger.LogDebug("Running migration {MigrationStep}", nameof(AddTestRunDataTable));

            if (TableExists(TestRunData.TableName))
            {
                Logger.LogDebug("Table {TableName} already exists, skipping creation.", TestRunData.TableName);
            }
            else
            {
                Logger.LogDebug("Creating table {TableName}.", TestRunData.TableName);
                Create.Table<TestRunData>().Do();
            }

            return Task.FromResult(0);
        }
    }
}
