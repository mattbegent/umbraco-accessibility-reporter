using System.Collections.Generic;
using AccessibilityReporter.Infrastructure.Config;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Umbraco.Cms.Core.Composing;
using Umbraco.Cms.Core.DependencyInjection;
using Umbraco.Cms.Core.Models;
using Umbraco.Cms.Core.Models.ContentEditing;
using Umbraco.Cms.Core.Models.Membership;

namespace AccessibilityReporter.Infrastructure
{
    
    internal class AccessibilityReporterComposer : IComposer 
    {
        public void Compose(IUmbracoBuilder builder)
        {
            builder.Services.Configure<AccessibilityReporterSettings>
                (builder.Config.GetSection(AccessibilityReporterSettings.SectionName));

            builder.AddContentApp<AccessibilityReporter>();
        }

    }

    public class AccessibilityReporter : IContentAppFactory
    {
        private readonly IOptions<AccessibilityReporterSettings> _accessibilityReporterOptions;

        public AccessibilityReporter(IOptions<AccessibilityReporterSettings> accessibilityReporterOptions)
        {
            _accessibilityReporterOptions = accessibilityReporterOptions;
        }

        public ContentApp? GetContentAppFor(object source, IEnumerable<IReadOnlyUserGroup> userGroups)
        {
            
            var userAllowed = false;
            foreach (var userGroup in userGroups)
            {
                if(_accessibilityReporterOptions.Value.WithDefaults().UserGroups.Contains(userGroup.Alias)) {
                    userAllowed = true;
                    break;
                }
            }  

            if(!userAllowed) {
                return null;
            }
                
            // Only show app on content items
            if (!(source is IContent))
                return null;
                
            var content = ((IContent)source);
                
            // Only show app on content items with template
            if (content.TemplateId is null)
                return null;

            // Exclude doc types that Kevin doesn't like
            if(_accessibilityReporterOptions.Value.WithDefaults().ExcludedDocTypes != null 
            && _accessibilityReporterOptions.Value.WithDefaults().ExcludedDocTypes.Contains(content.ContentType.Alias)) {
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
