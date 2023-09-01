class ARScore extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    getCSSClass(score) {
        if(score > 89) {
            return 'c-score--pass';
        }
        if(score > 49) {
            return 'c-score--average';
        }
        return 'c-score--fail';
    }

    connectedCallback() {

        // delay while angular renders
        setTimeout(()=> {

            if (!this.getAttribute('[attr.score]') || this.getAttribute('[attr.score]').startsWith('{{')) {
                return;
            }

            const score = parseInt(this.getAttribute('[attr.score]'));

            this.shadowRoot.innerHTML = `
            <style>
            .c-score {
                position: relative;
                width: 120px;
                height: 120px;
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

            </style>

            <div class="c-score ${this.getCSSClass(score)} ${this.hasAttribute('large') ? "c-score--large" : ""}">
                <svg viewBox="0 0 36 36" class="c-score__inner">
                    <path class="c-score__background"
                        d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path class="c-score__fill"
                        stroke-dasharray="${score}, 100"
                        d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                </svg>
                <div class="c-score__text">
                    <span class="c-score__text-number">${score}</span>
                    ${!this.hasAttribute('hideScoreText') ?  `<span class="c-score__text-title">Score</span>` : ``}
                </div>
            </div>`;


        }, 100);

    }

}

customElements.define('ar-score', ARScore);
