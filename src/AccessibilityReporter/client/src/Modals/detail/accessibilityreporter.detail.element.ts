import { customElement, html } from "@umbraco-cms/backoffice/external/lit";
import { UmbModalBaseElement, UmbModalRejectReason } from "@umbraco-cms/backoffice/modal";
import { css } from "lit";
import { DetailModalData, DetailModalValue } from "./accessibilityreporter.detail.modal.token.ts";

@customElement('accessibility-report-detail-modal')
export class DetailModalElement extends UmbModalBaseElement<DetailModalData, DetailModalValue>
{
    constructor() {
        super();
        // If any contexts needed consume them in ctor
    }

    connectedCallback() {
        super.connectedCallback();

        console.log('data in when in connected callback', this.data);
    }

    private submitSomething() {

        this.modalContext?.setValue({
            thing: 'What up Bege'
        });
        this.modalContext?.submit();
    }

    private handleClose() {
        this.modalContext?.reject({ type: "close" } as UmbModalRejectReason);
    }
    
    render() {

        // let listItems: TemplateResult[] = [];

        // // Convert the record to an array of entries, sort them by key, then iterate over them
        // Object.entries(this.examineRecord?.values ?? {})
        //     .forEach(([key, value]) => {
        //         listItems.push(html`
        //             <umb-property-layout label="${key}">                      
        //                 <div id="editor" slot="editor">
        //                     <code>${value}</code>                            
        //                 </div>
        //             </umb-property-layout>
        //         `);
        // });
        
        return html`
            <umb-body-layout headline="Bege Modal">
                
                <uui-box headline="Data">
                    <pre>${JSON.stringify(this.data, null, 2)}</pre>
                </uui-box>
                
                <div slot="actions">
                    <uui-button label="Submit" look="primary" @click="${this.submitSomething}">Submit</uui-button>
                    <uui-button label="Close" @click="${this.handleClose}">Close</uui-button>
                </div>
            </umb-body-layout>
        `;
    }
    
    static styles = css`
        uui-box {
            margin-bottom: 1rem;
        }
    `;
}

export default DetailModalElement;