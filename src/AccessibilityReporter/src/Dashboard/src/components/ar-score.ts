import { LitElement, html, customElement, css, property } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";

@customElement("ar-score")
export class ARScoreElement extends UmbElementMixin(LitElement) {

	@property()
	score: number;

	@property({ type: Boolean })
	large: boolean;

	@property({ type: Boolean })
	hideScoreText: boolean;

	private getCSSClass(score: number) {
		if (score > 89) {
			return 'c-score--pass';
		}
		if (score > 49) {
			return 'c-score--average';
		}
		return 'c-score--fail';
	}

	render() {
		return html`
			<div class="c-score ${this.getCSSClass(this.score)} ${this.large ? "c-score--large" : ""}">
                <svg viewBox="0 0 36 36" class="c-score__inner">
                    <path class="c-score__background"
                        d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path class="c-score__fill"
                        stroke-dasharray="${this.score}, 100"
                        d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                </svg>
                <div class="c-score__text">
                    <span class="c-score__text-number">${this.score}</span>
                    ${!this.hideScoreText ? html`<span class="c-score__text-title">Score</span>` : ``}
                </div>
            </div>
		`;
	}

	static styles = [
		css`
		.c-score {
			position: relative;
			width: 130px;
			height: 130px;
			margin: 0 auto;
		}

		.c-score__inner {
			display: block;
			width: 100%;
			height: 100%;
		}

		.c-score__background {
			fill: none;
			stroke: #eee;
			stroke-width: 1.75;
		}

		.c-score__fill {
			fill: none;
			stroke: none;
			stroke-width: 1.75;
			stroke-linecap: round;
			animation: progress 1000ms ease-out forwards;
		}

		@keyframes progress {
			0% {
				stroke-dasharray: 0 100;
			}
		}

		.c-score__text {
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			position: absolute;
			top: 0;
			bottom: 0;
			left: 0;
			right: 0;
			margin: auto;
			z-index: 1;
			font-weight: 700;
		}

		.c-score__text-number {
			font-size: 34px;
		}

		.c-score__text-title {
			font-size: 16px;
			margin-top: 10px;
		}

		.c-score--pass .c-score__fill {
			stroke: #1C824A;
		}

		.c-score--average .c-score__fill {
			stroke: #f79c37;
		}

		.c-score--fail .c-score__fill {
			stroke: #d42054;
		}

		.c-score--large {
			width: 150px;
			height: 150px;
		}
		.c-score--large .c-score__text-number {
			font-size: 4rem;
		}
		`
	];
}

declare global {
	interface HTMLElementTagNameMap {
		"ar-score": ARScoreElement;
	}
}
