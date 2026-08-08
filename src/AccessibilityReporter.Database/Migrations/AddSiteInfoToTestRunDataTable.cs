using AccessibilityReporter.Database.Data.Models;
using Microsoft.Extensions.Logging;
using NPoco.DatabaseTypes;
using Umbraco.Cms.Infrastructure.Migrations;

namespace AccessibilityReporter.Database.Migrations
{
    // Added as a new step rather than editing AddTestRunDataTable, since that step may already have
    // run against installed sites - Umbraco migrations are meant to be additive.
    internal class AddSiteInfoToTestRunDataTable : AsyncMigrationBase
    {
        private const string RootContentIdIndexName = "IX_AccessibilityReporterTestRunData_RootContentId";
        private const string RunCompletedIndexName = "IX_AccessibilityReporterTestRunData_RunCompleted";

        public AddSiteInfoToTestRunDataTable(IMigrationContext context)
            : base(context)
        { }

        protected override Task MigrateAsync()
        {
            Logger.LogDebug("Running migration {MigrationStep}", nameof(AddSiteInfoToTestRunDataTable));

            // The Alter.Table builder throws NotSupportedException outright on SQLite (any operation,
            // not just unsupported ones), so a simple ADD COLUMN has to go through raw SQL there
            // instead - SQLite does support that specific statement natively. Column types match what
            // Create.Table<TestRunData>() already produced for the existing Guid/string columns on
            // SQLite (verified against the dev DB's schema): plain TEXT for Guid, TEXT COLLATE NOCASE
            // for strings.
            var isSqlite = DatabaseType is SQLiteDatabaseType;

            if (!ColumnExists(TestRunData.TableName, nameof(TestRunData.RootContentId)))
            {
                if (isSqlite)
                {
                    Execute.Sql($"ALTER TABLE {TestRunData.TableName} ADD COLUMN {nameof(TestRunData.RootContentId)} TEXT NULL").Do();
                }
                else
                {
                    Alter.Table(TestRunData.TableName)
                        .AddColumn(nameof(TestRunData.RootContentId)).AsGuid().Nullable()
                        .Do();
                }
            }

            if (!ColumnExists(TestRunData.TableName, nameof(TestRunData.RootName)))
            {
                if (isSqlite)
                {
                    Execute.Sql($"ALTER TABLE {TestRunData.TableName} ADD COLUMN {nameof(TestRunData.RootName)} TEXT COLLATE NOCASE NULL").Do();
                }
                else
                {
                    Alter.Table(TestRunData.TableName)
                        .AddColumn(nameof(TestRunData.RootName)).AsString(255).Nullable()
                        .Do();
                }
            }

            // Used by site trend aggregation (SiteHistoryService) and by the retention cleanup job
            // respectively - both filter/sort on these columns across potentially large tables.
            if (!IndexExists(RootContentIdIndexName))
            {
                Create.Index(RootContentIdIndexName)
                    .OnTable(TestRunData.TableName)
                    .OnColumn(nameof(TestRunData.RootContentId))
                    .Ascending()
                    .Do();
            }

            if (!IndexExists(RunCompletedIndexName))
            {
                Create.Index(RunCompletedIndexName)
                    .OnTable(TestRunData.TableName)
                    .OnColumn(nameof(TestRunData.RunCompleted))
                    .Ascending()
                    .Do();
            }

            return Task.FromResult(0);
        }
    }
}
