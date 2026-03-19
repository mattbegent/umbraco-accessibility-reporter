using AccessibilityReporter.Database.Migrations;
using Umbraco.Cms.Core.Events;
using Umbraco.Cms.Core.Migrations;
using Umbraco.Cms.Core.Notifications;
using Umbraco.Cms.Core.Scoping;
using Umbraco.Cms.Core.Services;
using Umbraco.Cms.Infrastructure.Migrations;
using Umbraco.Cms.Infrastructure.Migrations.Upgrade;

namespace AccessibilityReporter.Database.Infrastructure.NotificationHandlers
{
    internal class HistoryNotificationHandler : INotificationHandler<UmbracoApplicationStartingNotification>
    {
        private readonly ICoreScopeProvider _coreScopeProvider;
        private readonly IMigrationPlanExecutor _migrationPlanExecutor;
        private readonly IKeyValueService _keyValueService;

        public HistoryNotificationHandler(ICoreScopeProvider coreScopeProvider,
            IMigrationPlanExecutor migrationPlanExecutor,
            IKeyValueService keyValueService,
            IRuntimeState runtimeState)
        {
            _coreScopeProvider = coreScopeProvider;
            _migrationPlanExecutor = migrationPlanExecutor;
            _keyValueService = keyValueService;
        }

        public void Handle(UmbracoApplicationStartingNotification notification)
        {
            var migrationPlan = new MigrationPlan("HistoryInitial");

            migrationPlan.From(string.Empty)
                .To<AddTestRunDataTable>("history-initial");

            var upgrader = new Upgrader(migrationPlan);
            upgrader.ExecuteAsync(_migrationPlanExecutor, _coreScopeProvider, _keyValueService);
        }
    }
}
