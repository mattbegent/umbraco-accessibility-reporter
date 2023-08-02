using AccessibilityReporter.Infrastructure.Config;
using System.Collections.Generic;
using Umbraco.Cms.Core.Models.ContentEditing;
using Umbraco.Cms.Core.Models.Membership;
using Umbraco.Cms.Core.Models;
using System.Linq;
using Microsoft.Extensions.Options;

namespace AccessibilityReporter.Infrastructure
{
	internal class AccessibilityReporterFactory : IContentAppFactory
	{
		private readonly IOptions<AccessibilityReporterAppSettings> _accessibilityReporterSettings;

		public AccessibilityReporterFactory(IOptions<AccessibilityReporterAppSettings> accessibilityReporterSettings)
		{
			_accessibilityReporterSettings = accessibilityReporterSettings;
		}

		public ContentApp? GetContentAppFor(object source, IEnumerable<IReadOnlyUserGroup> userGroups)
		{
			var content = source as IContent;

			if (content == null || content.TemplateId.HasValue == false)
			{
				return null;
			}

			if (_accessibilityReporterSettings.Value.ExcludedDocTypes
				.Contains(content.ContentType.Alias))
			{
				return null;
			}

			var userGroupAliases = userGroups.Select(x => x.Alias);

			if (_accessibilityReporterSettings.Value.UserGroups
				.Intersect(userGroupAliases).Any() == false)
			{
				return null;
			}

			return new ContentApp
			{
				Alias = "AccessibilityReporter",
				Name = "Accessibility",
				Icon = "icon-globe-alt",
				View = "/App_Plugins/AccessibilityReporter/accessibility-reporter-content-app.html",
				Weight = 0
			};
		}
	}
}
