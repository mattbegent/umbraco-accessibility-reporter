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

            if (!this.getAttribute('[attr.data]') || this.getAttribute('[attr.data]').startsWith('{{')) {
                return;
            }

            let chartSettings = {
                type: this.getAttribute('type'),
                data: JSON.parse(this.getAttribute('[attr.data]'))
            };

            if(this.getAttribute('type') === 'bar') {
                chartSettings.options = {  
                    scales: {
                        y: {
                            ticks: {
                                precision: 0
                            }
                        }
                    }
                };
            }

            new Chart(ctx, chartSettings);
        }, 100);

    }

}

customElements.define('ar-chart', ARChart);