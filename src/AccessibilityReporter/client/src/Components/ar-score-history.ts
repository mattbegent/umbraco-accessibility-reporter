import { LitElement, html, customElement, property } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import { format } from 'date-fns';
import Chart from 'chart.js/auto';
import type { TestRun } from '../api';

@customElement("ar-score-history")
export class ARScoreHistoryElement extends UmbElementMixin(LitElement) {

	@property({ attribute: false })
	history: TestRun[] = [];

	private _chart: Chart | undefined;

	connectedCallback() {
		super.connectedCallback();
		setTimeout(() => {
			this.initChart();
		}, 100);
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		this._chart?.destroy();
	}

	private initChart() {
		if (!this.shadowRoot || this.history.length === 0) {
			return;
		}

		const ctx = this.shadowRoot.querySelector('canvas') as HTMLCanvasElement;
		if (!ctx) {
			return;
		}

		const sorted = [...this.history].sort(
			(a, b) => new Date(a.runCompleted).getTime() - new Date(b.runCompleted).getTime()
		);

		const labels = sorted.map(run => format(run.runCompleted, "d MMM ''yy"));
		const fullDates = sorted.map(run => format(run.runCompleted, "d MMM yyyy HH:mm"));
		const scores = sorted.map(run => run.score);

		this._chart = new Chart(ctx, {
			type: 'line',
			data: {
				labels,
				datasets: [
					{
						label: 'Score',
						data: scores,
						borderColor: '#443b52',
						backgroundColor: 'rgba(68, 59, 82, 0.1)',
						borderWidth: 2,
						pointBackgroundColor: '#443b52',
						pointRadius: 4,
						fill: true,
						tension: 0.3,
					},
				],
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				scales: {
					y: {
						min: 0,
						max: 100,
						ticks: {
							stepSize: 20,
							font: { family: 'Lato' },
						},
						title: {
							display: true,
							text: 'Score',
							font: { family: 'Lato' },
						},
					},
					x: {
						ticks: {
							font: { family: 'Lato' },
							maxRotation: 45,
						},
					},
				},
				plugins: {
					legend: {
						display: false,
					},
					tooltip: {
						callbacks: {
							title: (items) => fullDates[items[0].dataIndex],
							label: (context) => ` Score: ${context.parsed.y}`,
						},
					},
				},
			},
		});
	}

	render() {
		return html`
			<div style="position: relative; height: 250px;">
				<canvas></canvas>
			</div>
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		"ar-score-history": ARScoreHistoryElement;
	}
}
