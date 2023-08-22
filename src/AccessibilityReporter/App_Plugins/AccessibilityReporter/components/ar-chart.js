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
        const labelFontStyles = {
            size: '15px',
            lineHeight: 1,
            family: 'Lato'
        };

        // delay while angular renders
        setTimeout(()=> {

            if (!this.getAttribute('[attr.data]') || this.getAttribute('[attr.data]').startsWith('{{')) {
                return;
            }

            let chartSettings = {
                type: this.getAttribute('type'),
                data: JSON.parse(this.getAttribute('[attr.data]')),
                plugins: [ChartDataLabels]
            };

            if(this.getAttribute('type') === 'pie') {
                chartSettings.options = {};
                chartSettings.options.plugins = {  
                    tooltip: {
                        enabled: false
                    },
                    datalabels: {
                        clip : true,
                        backgroundColor: '#FFF',
                        font: labelFontStyles,
                        align: 'top',
                        formatter: ((context, args)=> {
                            if(context) {
                                const index = args.dataIndex;
                                return context + " " + args.chart.data.labels[index];
                            } else {
                                return null;
                            }
                        })
                    }
                }
            }

            if(this.getAttribute('type') === 'bar') {
                chartSettings.options = {  
                    scales: {
                        y: {
                            ticks: {
                                precision: 0
                            }
                        }
                    },
                    plugins: {
                        tooltip: {
                            enabled: false
                        },
                        legend: {
                            display: false
                        },
                        datalabels: {
                            backgroundColor: '#FFF',
                            font: labelFontStyles,
                            padding: {
                                left: 6,
                                right: 6,
                                top: 2,
                                bottom: 2
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