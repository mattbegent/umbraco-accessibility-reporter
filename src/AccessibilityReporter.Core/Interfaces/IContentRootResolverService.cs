namespace AccessibilityReporter.Core.Interfaces
{
    public interface IContentRootResolverService
    {
        /// <summary>
        /// Resolves the site (root content node) that the given content belongs to, for attributing
        /// a test run to a site in a multisite install. Returns null if the content or its root can no
        /// longer be resolved (e.g. it's since been deleted).
        /// </summary>
        (Guid RootId, string RootName)? Resolve(Guid contentId);
    }
}
