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

            if (this.getAttribute('type') === 'pie') {

                for (let index = 0; index < chartSettings.data.datasets.length; index++) {
                    chartSettings.data.datasets[index].backgroundColor = chartSettings.data.datasets[index].backgroundColor.map((color, colorIndex) => {
                        if (colorIndex === 0) {
                            return color;
                        }
                        return pattern.draw(this.getPattern(colorIndex), color);
                    });
                }
                chartSettings.options = {};
                chartSettings.options.plugins = {
                    tooltip: {
                        enabled: true
                    },
                    datalabels: {
                        clip : true,
                        backgroundColor: '#FFF',
                        color: '#000',
                        borderColor: "#000",
                        borderWidth: 2,
                        font: labelFontStyles,
                        align: 'top',
                        display: 'auto',
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
                            enabled: true
                        },
                        legend: {
                            display: false
                        },
                        datalabels: {
                            backgroundColor: '#FFF',
                            color: '#000',
                            font: labelFontStyles,
                            borderColor: "#000",
                            borderWidth: 2,
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

    getPattern(index) {
        switch (index) {
            case 1:
                return "diagonal";
            case 2:
                return "zigzag-horizontal";
            case 3:
                return "circle";
            case 4:
                return "zigzag-vertical";
            case 5:
                return "triangle";
            case 6:
                return "dot";
            default:
                return "diamond";
        };
    }

}

customElements.define('ar-chart', ARChart);
