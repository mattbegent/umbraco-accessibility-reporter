using AccessibilityReporter.Core.Interfaces.Data;
using AccessibilityReporter.Core.Interfaces.Repositories;
using AccessibilityReporter.Database.Data.Models;
using Umbraco.Cms.Infrastructure.Scoping;

namespace AccessibilityReporter.Database.Repositories
{
    internal class TestRunSqlRepository : ITestRunRepository
    {
        private readonly IScopeProvider _scopeProvider;

        public TestRunSqlRepository(IScopeProvider scopeProvider)
        {
            _scopeProvider = scopeProvider;
        }

        public void Create(ITestRunData testRunData)
        {
            using var scope = _scopeProvider.CreateScope();

            scope.Database.Insert((TestRunData)testRunData);

            scope.Complete();
        }

        public ITestRunData? Run(Guid contentId, string culture, string contentHash)
        {
            using var scope = _scopeProvider.CreateScope();

            var queryResults = scope.Database.SingleOrDefault<TestRunData>($"SELECT * " +
                $"FROM {TestRunData.TableName} " +
                $"WHERE {nameof(TestRunData.ContentId)} = @0 " +
                $"AND {nameof(TestRunData.Culture)} = @1 " +
                $"AND {nameof(TestRunData.ContentHash)} = @2 " +
                $"ORDER BY {nameof(TestRunData.RunCompleted)}"
            , contentId, culture, contentHash);

            scope.Complete();

            return queryResults;
        }

        public IEnumerable<ITestRunData> Runs(Guid contentId, string culture)
        {
            using var scope = _scopeProvider.CreateScope();

            var queryResults = scope.Database.Fetch<TestRunData>($"SELECT * " +
                $"FROM {TestRunData.TableName} " +
                $"WHERE {nameof(TestRunData.ContentId)} = @0 " +
                $"AND {nameof(TestRunData.Culture)} = @1 " +
                $"ORDER BY {nameof(TestRunData.RunCompleted)} DESC"
            , contentId, culture);

            scope.Complete();

            return queryResults;
        }

        public void DeleteOlderThan(DateTime threshold)
        {
            using var scope = _scopeProvider.CreateScope();

            scope.Database.Execute($"DELETE FROM {TestRunData.TableName} " +
                $"WHERE {nameof(TestRunData.RunCompleted)} < @0"
            , threshold);

            scope.Complete();
        }

        public IEnumerable<(Guid RootId, string RootName)> Sites()
        {
            using var scope = _scopeProvider.CreateScope();

            var queryResults = scope.Database.Fetch<TestRunData>($"SELECT DISTINCT " +
                $"{nameof(TestRunData.RootContentId)}, {nameof(TestRunData.RootName)} " +
                $"FROM {TestRunData.TableName} " +
                $"WHERE {nameof(TestRunData.RootContentId)} IS NOT NULL"
            );

            scope.Complete();

            return queryResults
                .Where(row => row.RootContentId.HasValue && !string.IsNullOrEmpty(row.RootName))
                .Select(row => (row.RootContentId!.Value, row.RootName!))
                .Distinct()
                .ToList();
        }

        public IEnumerable<ITestRunData> RunsForRoot(Guid rootContentId, string? culture)
        {
            using var scope = _scopeProvider.CreateScope();

            var queryResults = string.IsNullOrEmpty(culture)
                ? scope.Database.Fetch<TestRunData>($"SELECT * " +
                    $"FROM {TestRunData.TableName} " +
                    $"WHERE {nameof(TestRunData.RootContentId)} = @0 " +
                    $"ORDER BY {nameof(TestRunData.RunCompleted)}"
                , rootContentId)
                : scope.Database.Fetch<TestRunData>($"SELECT * " +
                    $"FROM {TestRunData.TableName} " +
                    $"WHERE {nameof(TestRunData.RootContentId)} = @0 " +
                    $"AND {nameof(TestRunData.Culture)} = @1 " +
                    $"ORDER BY {nameof(TestRunData.RunCompleted)}"
                , rootContentId, culture);

            scope.Complete();

            return queryResults;
        }
    }
}
