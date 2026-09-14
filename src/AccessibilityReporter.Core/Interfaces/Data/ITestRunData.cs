namespace AccessibilityReporter.Core.Interfaces.Data
{
    public interface ITestRunData
    {
        Guid ContentId { get; set; }

        string Culture { get; set; }

        string ContentHash { get; set; }

        DateTime RunCompleted { get; set; }

        string ResultPayload { get; set; }

        int ResultPayloadVersion { get; set; }

        Guid? RootContentId { get; set; }

        string? RootName { get; set; }
    }
}
