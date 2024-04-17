import { ManifestCondition } from "@umbraco-cms/backoffice/extension-api";
import { TemplateSetCondition } from "./accessibiltyreporter.condition.templateset";
import { UserGroupHasAccesstCondition } from "./accessibiltyreporter.condition.usergrouphasaccess";

const templateSet: ManifestCondition = {
    type: "condition",
    name: "Accessbility Reporter - Template Set Condition",
    alias: "AccessibilityReporter.Condition.TemplateSet",
    api: TemplateSetCondition    
};

const userGroupHasAccess: ManifestCondition = {
    type: "condition",
    name: "Accessbility Reporter - User Group Has Access Condition",
    alias: "AccessibilityReporter.Condition.UserGroupHasAccess",
    api: UserGroupHasAccesstCondition
}

export const manifests = [templateSet, userGroupHasAccess];