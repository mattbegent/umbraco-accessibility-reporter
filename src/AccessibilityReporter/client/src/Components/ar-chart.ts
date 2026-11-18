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

	// Called with the index of the bar or slice that was clicked.
	@property({attribute: false})
	onSelect?: (index: number) => void;

	private chart?: Chart;

	connectedCallback() {
		super.connectedCallback();
		setTimeout(()=> {
			this.initChart();
		}, 100);
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		this.chart?.destroy();
		this.chart = undefined;
	}

	updated(changedProperties: Map<string, unknown>) {
		super.updated(changedProperties);
		// Redraw when the data changes (e.g. filtering by site), so clicks map to the right item.
		if (changedProperties.has('data') && this.chart) {
			this.initChart();
		}
	}

	private initChart() {

		if(!this.shadowRoot || !this.data) {
			return;
		}

		this.chart?.destroy();
		this.chart = undefined;

        const ctx = this.shadowRoot.querySelector('canvas') as HTMLCanvasElement;
        const labelFontStyles = {
            size: '15px',
            lineHeight: 1,
            family: 'Lato'
        };

		let chartSettings: any = {
			type: this.type,
			data: this.data,
			plugins: [ChartDataLabels],
			responsive: true,
    		maintainAspectRatio: false
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

		if (this.onSelect) {
			chartSettings.options = chartSettings.options ?? {};
			chartSettings.options.onClick = (_event: unknown, elements: { index: number }[]) => {
				if (elements.length) {
					this.onSelect?.(elements[0].index);
				}
			};
			chartSettings.options.onHover = (event: any, elements: unknown[]) => {
				const target = event?.native?.target as HTMLElement | undefined;
				if (target) {
					target.style.cursor = elements.length ? 'pointer' : 'default';
				}
			};
		}

		this.chart = new Chart(ctx, chartSettings);

	}

	render() {
		return html`
		<div class="chart-container" style="position: relative; max-height: ${this.height}px; max-width: ${this.width}px; margin: 0 auto;">
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
