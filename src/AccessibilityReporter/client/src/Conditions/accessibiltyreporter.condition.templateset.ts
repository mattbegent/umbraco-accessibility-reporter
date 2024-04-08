import type { UmbControllerHost } from '@umbraco-cms/backoffice/controller-api';
import { UmbConditionConfigBase, UmbConditionControllerArguments, UmbExtensionCondition } from "@umbraco-cms/backoffice/extension-api";
import { UMB_DOCUMENT_WORKSPACE_CONTEXT  } from '@umbraco-cms/backoffice/document';
import { UmbConditionBase } from '@umbraco-cms/backoffice/extension-registry';

export type TemplateSetConditionConfig = UmbConditionConfigBase<'AccessibilityReporter.Condition.TemplateSet'> & {
    /**
     * HasTemplateSet
	 * Decide if the current document should have a template set or not
	 *
	 * @example
	 * true
	 */
    hasTemplateSet: boolean;
};

export class TemplateSetCondition extends UmbConditionBase<TemplateSetConditionConfig> implements UmbExtensionCondition
{
    config: TemplateSetConditionConfig;

    constructor(host: UmbControllerHost, args: UmbConditionControllerArguments<TemplateSetConditionConfig>) {
        super(host, args);
        
        this.consumeContext(UMB_DOCUMENT_WORKSPACE_CONTEXT , (workspaceCtx) => {
            this.observe(workspaceCtx.templateId, (templateId) => {
                console.log('templateId', templateId);

                // No template set === null
                // Tempate set we get a GUID back

                // Config says it passes if template IS set (aka NOT null)
                if(this.config.hasTemplateSet && templateId !== null) {
                    this.permitted = true;
                    return;
                }

                // Config says it passes if template is NOT set (aka IS null)
                if(this.config.hasTemplateSet === false && templateId === null) {
                    this.permitted = true;
                    return;
                }

                this.permitted = false;
            })

		});
    }

}