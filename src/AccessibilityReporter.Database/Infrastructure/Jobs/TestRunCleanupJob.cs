using AccessibilityReporter.Core.Interfaces;
using AccessibilityReporter.Core.Interfaces.Repositories;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Umbraco.Cms.Infrastructure.BackgroundJobs;

namespace AccessibilityReporter.Database.Infrastructure.Jobs
{
    // Registered via AddRecurringBackgroundJob<T>(), which resolves jobs as singletons - so
    // ITestRunRepository (scoped) can't be constructor-injected directly here. A scope is created
    // per run instead, the standard pattern for a singleton needing a scoped dependency.
    internal class TestRunCleanupJob : IRecurringBackgroundJob
    {
        private readonly IServiceScopeFactory _serviceScopeFactory;
        private readonly IAccessibilityReporterSettings _settings;
        private readonly ILogger<TestRunCleanupJob> _logger;

        public TimeSpan Period => TimeSpan.FromHours(24);

        public event EventHandler PeriodChanged
        {
            add { }
            remove { }
        }

        public TestRunCleanupJob(IServiceScopeFactory serviceScopeFactory,
            IAccessibilityReporterSettings settings,
            ILogger<TestRunCleanupJob> logger)
        {
            _serviceScopeFactory = serviceScopeFactory;
            _settings = settings;
            _logger = logger;
        }

        public Task RunJobAsync()
        {
            if (_settings.HistoryRetentionDays <= 0)
            {
                _logger.LogDebug("Accessibility reporter history cleanup is disabled (HistoryRetentionDays <= 0)");
                return Task.CompletedTask;
            }

            using var scope = _serviceScopeFactory.CreateScope();
            var testRunRepository = scope.ServiceProvider.GetRequiredService<ITestRunRepository>();

            var threshold = DateTime.Now.AddDays(-_settings.HistoryRetentionDays);
            _logger.LogDebug("Cleaning up accessibility reporter test run history older than {Threshold}", threshold);
            testRunRepository.DeleteOlderThan(threshold);

            return Task.CompletedTask;
        }
    }
}
