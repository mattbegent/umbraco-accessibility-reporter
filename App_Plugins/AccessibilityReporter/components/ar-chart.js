class ARChart extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
        <div class="chart-container" style="position: relative; height: ${this.getAttribute('height')}px; width: ${this.getAttribute('width')}px; margin: 0 auto;">
            <canvas></canvas>
        </div>`;
    }

    connectedCallback() {
        const ctx = this.shadowRoot.querySelector('canvas');

        // delay while angular renders
        setTimeout(()=> {
            console.log(JSON.parse(this.getAttribute('[attr.data]')));
            new Chart(ctx, {
                type: this.getAttribute('type'),
                data: JSON.parse(this.getAttribute('[attr.data]'))
            });
        }, 100);

    }

}

customElements.define('ar-chart', ARChart);