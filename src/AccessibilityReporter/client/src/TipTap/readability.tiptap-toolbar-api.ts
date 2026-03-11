import { UmbTiptapToolbarElementApiBase } from '@umbraco-cms/backoffice/tiptap';
import type { Editor } from '@umbraco-cms/backoffice/external/tiptap';
import { UMB_MODAL_MANAGER_CONTEXT } from '@umbraco-cms/backoffice/modal';
import { UMB_AUTH_CONTEXT } from '@umbraco-cms/backoffice/auth';
import { ACCESSIBILITY_REPORTER_READABILITY_MODAL } from '../Modals/readability/accessibilityreporter.readability.modal.token.js';

export default class AccessibilityReporterReadabilityToolbarApi extends UmbTiptapToolbarElementApiBase {

    override async execute(editor?: Editor) {
        if (!editor) return;

        const html = editor.getHTML();

        const modalManager = await this.getContext(UMB_MODAL_MANAGER_CONTEXT);
        const authContext = await this.getContext(UMB_AUTH_CONTEXT);

        const config = authContext?.getOpenApiConfiguration();
        const token = config?.token ? await config.token() : undefined;

        if (!modalManager) return;

        const modalContext = modalManager.open(this, ACCESSIBILITY_REPORTER_READABILITY_MODAL, {
            data: {
                html,
                apiBaseUrl: config?.base ?? '',
                authToken: token ?? ''
            }
        });

        try {
            const result = await modalContext.onSubmit();
            if (result?.approvedHtml) {
                editor.chain().focus().setContent(result.approvedHtml).run();
            }
        } catch {
            // Modal was rejected/closed — do nothing
        }
    }
}
