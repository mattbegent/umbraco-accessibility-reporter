using AccessibilityReporter.Infrastructure.Config;
using System.Collections.Generic;
using Umbraco.Cms.Core.Models.ContentEditing;
using Umbraco.Cms.Core.Models.Membership;
using Umbraco.Cms.Core.Models;
using System.Linq;

namespace AccessibilityReporter.Infrastructure
{
	internal class AccessibilityReporterFactory : IContentAppFactory
	{
		private readonly IAccessibilityReporterSettings _accessibilityReporterSettings;

		public AccessibilityReporterFactory(IAccessibilityReporterSettings accessibilityReporterSettings)
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

			var userGroupAliases = userGroups.Select(x => x.Alias);

			if (_accessibilityReporterSettings.UserGroups
				.Intersect(userGroupAliases).Any() == false)
			{
				return null;
			}

			if (_accessibilityReporterSettings.ExcludedDocTypes
				.Contains(content.ContentType.Alias))
			{
				return null;
			}

			return new ContentApp
			{
				Alias = "AccessibilityReporter",
				Name = "Accessibility",
				Icon = "icon-globe-alt",
				View = "/App_Plugins/AccessibilityReporter/accessibility-reporter.html",
				Weight = 0
			};
		}
	}
}
