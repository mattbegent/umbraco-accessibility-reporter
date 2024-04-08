import { ManifestCondition } from "@umbraco-cms/backoffice/extension-api";
import { TemplateSetCondition } from "./accessibiltyreporter.condition.templateset";

const templateSet: ManifestCondition = {
    type: "condition",
    name: "Accessbility Reporter - Template Set Condition",
    alias: "AccessibilityReporter.Condition.TemplateSet",
    api: TemplateSetCondition    
};

export const manifests = [templateSet];