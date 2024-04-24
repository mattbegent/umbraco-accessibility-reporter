import type { UmbControllerHost } from '@umbraco-cms/backoffice/controller-api';
import { UmbConditionConfigBase, UmbConditionControllerArguments, UmbExtensionCondition } from "@umbraco-cms/backoffice/extension-api";
import { UMB_DOCUMENT_WORKSPACE_CONTEXT  } from '@umbraco-cms/backoffice/document';
import { UmbConditionBase } from '@umbraco-cms/backoffice/extension-registry';
import { tryExecuteAndNotify } from '@umbraco-cms/backoffice/resources';
import { ConfigService } from '../Api';

export type TemplateSetConditionConfig = UmbConditionConfigBase<'AccessibilityReporter.Condition.TemplateSet'>;

export class TemplateSetCondition extends UmbConditionBase<TemplateSetConditionConfig> implements UmbExtensionCondition
{
    constructor(host: UmbControllerHost, args: UmbConditionControllerArguments<TemplateSetConditionConfig>) {
        super(host, args);
        
        this.consumeContext(UMB_DOCUMENT_WORKSPACE_CONTEXT , (workspaceCtx) => {
            this.observe(workspaceCtx.templateId, async (templateId) => {

                // No template set === null
                // Tempate set we get a GUID back
                console.log('templateId', templateId);

                // Look up the value we have from our own C# API
                // If we have a match on any then permitted is true
                const { data, error } = await tryExecuteAndNotify(this, ConfigService.current())
                if (error) {
                    console.error('Error fetching config via API', error);
                }
                
                // Value from API controller that is the config value
                const includeIfNoTemplateSet = data?.includeIfNoTemplate;
                console.log('includeIfNoTemplateSet', includeIfNoTemplateSet);

                // Passes if config says the doc SHOULD have a template set (aka NOT null)
                if(includeIfNoTemplateSet === false && templateId !== null) {
                    this.permitted = true;
                    return;
                }

                // Config says it passes if template is NOT set (aka IS null)
                if(includeIfNoTemplateSet && templateId === null) {
                    this.permitted = true;
                    return;
                }

                this.permitted = false;
            })

		});
    }

}