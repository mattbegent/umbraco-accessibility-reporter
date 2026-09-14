using AccessibilityReporter.Core.Interfaces.Repositories;
using AccessibilityReporter.Database.Infrastructure.Jobs;
using AccessibilityReporter.Database.Infrastructure.NotificationHandlers;
using AccessibilityReporter.Database.Repositories;
using Microsoft.Extensions.DependencyInjection;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using Umbraco.Cms.Core.Notifications;
using Umbraco.Extensions;

namespace AccessibilityReporter.Database.Infrastructure
{
    internal class DatabaseComposer : IComposer
    {
        public void Compose(IUmbracoBuilder builder)
        {
            builder.AddNotificationHandler<UmbracoApplicationStartingNotification, HistoryNotificationHandler>();

            builder.Services.AddScoped<ITestRunRepository, TestRunSqlRepository>();

            builder.Services.AddRecurringBackgroundJob<TestRunCleanupJob>();
        }
    }
}
