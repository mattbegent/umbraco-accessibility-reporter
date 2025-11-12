namespace AccessibilityReporter.Core.Interfaces.Data
{
    public interface ITestRunData
    {
        Guid ContentId { get; set; }

        DateTime RunCompleted { get; set; }

        string ResultPayload { get; set; }

        int ResultPayloadVersion { get; set; }
    }
}
