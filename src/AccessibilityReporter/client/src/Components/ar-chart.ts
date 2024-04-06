import { LitElement, html, customElement, property } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import pattern from 'patternomaly';

@customElement("ar-chart")
export class ARChartElement extends UmbElementMixin(LitElement) {

	@property({attribute: false})
	data: object;

	@property()
	type: string;

	@property()
	height: string;

	@property()
	width: string;

	connectedCallback() {
		super.connectedCallback();
		setTimeout(()=> {
			this.initChart();
		}, 100);
	}

	private initChart() {

		if(!this.shadowRoot) {
			return;
		}

        const ctx = this.shadowRoot.querySelector('canvas') as HTMLCanvasElement;
        const labelFontStyles = {
            size: '15px',
            lineHeight: 1,
            family: 'Lato'
        };

		let chartSettings: any = {
			type: this.type,
			data: this.data,
			plugins: [ChartDataLabels]
		};

		if (this.type === 'pie') {

			for (let index = 0; index < chartSettings.data.datasets.length; index++) {
				chartSettings.data.datasets[index].backgroundColor = chartSettings.data.datasets[index].backgroundColor.map((color: string, colorIndex: number) => {
					const currentPattern = chartSettings.data.patterns[colorIndex];
					if (!currentPattern) {
						return color;
					}
					return pattern.draw(currentPattern, color);
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
					formatter: ((context: any, args: any)=> {
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

		if(this.type === 'bar') {
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

	}

	render() {
		return html`
		<div class="chart-container" style="position: relative; height: ${this.height}px; width: ${this.width}px; margin: 0 auto;">
            <canvas></canvas>
        </div>
		`;
	}

}

declare global {
	interface HTMLElementTagNameMap {
		"ar-chart": ARChartElement;
	}
}