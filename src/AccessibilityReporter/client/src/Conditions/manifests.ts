import { ManifestCondition } from "@umbraco-cms/backoffice/extension-api";
import { TemplateSetCondition } from "./accessibilityreporter.condition.templateset";
import { UserGroupHasAccessCondition } from "./accessibilityreporter.condition.usergrouphasaccess";

const templateSet: ManifestCondition = {
    type: "condition",
    name: "Accessibility Reporter - Template Set Condition",
    alias: "AccessibilityReporter.Condition.TemplateSet",
    api: TemplateSetCondition
};

const userGroupHasAccess: ManifestCondition = {
    type: "condition",
    name: "Accessibility Reporter - User Group Has Access Condition",
    alias: "AccessibilityReporter.Condition.UserGroupHasAccess",
    api: UserGroupHasAccessCondition
}

export const manifests = [templateSet, userGroupHasAccess];
