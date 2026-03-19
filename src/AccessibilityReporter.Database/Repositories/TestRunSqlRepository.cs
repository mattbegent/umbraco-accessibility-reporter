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
                $"ORDER BY {nameof(TestRunData.RunCompleted)}"
            , contentId, culture);

            scope.Complete();

            return queryResults;
        }
    }
}
