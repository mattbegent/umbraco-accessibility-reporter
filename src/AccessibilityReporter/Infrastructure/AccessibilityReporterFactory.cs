//using System.Collections.Generic;
//using Umbraco.Cms.Core.Models.ContentEditing;
//using Umbraco.Cms.Core.Models.Membership;
//using Umbraco.Cms.Core.Models;
//using System.Linq;
//using AccessibilityReporter.Core.Interfaces;

//namespace AccessibilityReporter.Infrastructure
//{
//	internal class AccessibilityReporterFactory : IContentAppFactory
//	{
//		private readonly IAccessibilityReporterSettings _settings;

//		public AccessibilityReporterFactory(IAccessibilityReporterSettings settings)
//		{
//			_settings = settings;
//		}

//		public ContentApp? GetContentAppFor(object source, IEnumerable<IReadOnlyUserGroup> userGroups)
//		{
//			var content = source as IContent;

//			if (content == null)
//			{
//				return null;
//			}

//			if(_settings.IncludeIfNoTemplate == false && content.TemplateId.HasValue == false) 
//			{
//				return null;
//			}

//			if (_settings.ExcludedDocTypes
//				.Contains(content.ContentType.Alias))
//			{
//				return null;
//			}

//			var userGroupAliases = userGroups.Select(x => x.Alias);

//			if (_settings.UserGroups
//				.Intersect(userGroupAliases).Any() == false)
//			{
//				return null;
//			}

//			return new ContentApp
//			{
//				Alias = "AccessibilityReporter",
//				Name = "Accessibility",
//				Icon = "icon-globe-alt",
//				View = "/App_Plugins/AccessibilityReporter/accessibility-reporter-content-app.html",
//				Weight = 0
//			};
//		}
//	}
//}
