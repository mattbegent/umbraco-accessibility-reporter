import { css } from "@umbraco-cms/backoffice/external/lit";

export const generalStyles = css`

    .c-title__group {
        display: grid;
        grid-template-columns: 40px 1fr;
        gap: 10px;
        align-items: center;
    }

    .c-title {
        font-size: 17.25px;
        margin: 0;
        font-weight: 700;
        line-height: 1.3;
    }

    .c-title__link {
        text-decoration: underline;
        text-underline-position: below;
    }

    .c-title__link:hover,
    .c-title__link:focus {
        text-decoration: none;
    }

    .c-accordion-header {
		display: flex;
		width: 100%;
		align-items: center;
		border: none;
		padding: 0;
		background-color: transparent;
		font-family: inherit;
		font-size: 17.25px;
		font-weight: inherit;
		font-size: inherit;
	}

	.c-detail-button {
		pointer-events: none;
		border: none;
		padding: 0;
		background-color: transparent;
		font-family: inherit;
		font-size: inherit;
		font-weight: inherit;
		font-size: inherit;
		white-space: nowrap;
		text-decoration: none;
    	color: inherit;
		line-height: 1;
	}

	.c-detail-button__group {
		display: flex;
		align-items: center;
	}

	.c-detail-button__text {
		margin-left: 5px;
	}

	.c-table__container {
		overflow-x: auto;
	}

	.c-table__container uui-table-head-cell {
		font-size: 14px;
	}

	.c-summary {
		text-align: center;
	}

	.c-summary__container {
		display: grid;
		gap: 20px;
		grid-template-columns: 1fr 1fr 1fr 1fr;
		max-width: 600px;
		overflow-x: auto;
		margin-bottom: 20px;
	}

	.c-summary__circle {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		border: 5px solid #d42054;
		height: 117px;
		width: 117px;
		border-radius: 100%;
		margin: 0 auto 10px auto;
		font-weight: 700;
		font-size: 34px;
	}

	.c-summary--passed .c-summary__circle {
		border-color: #1C824A;
	}

	.c-summary--incomplete .c-summary__circle {
		border-color: #f79c37;
	}

	.c-summary--info .c-summary__circle {
		border-color: #1b264f;
	}

	.c-summary__title {
		text-align: center;
		font-weight: 700;
		font-size: 16px;
		margin-top: 10px;
	}

	@media (max-width: 768px) {
		.c-summary__time {
			display: block;
			margin-top: 10px;
		}
	}

	.c-summary__button {
		margin-right: 10px;
	}

	.c-detail__title {
		font-size: 15px;
		font-weight: 700;
	}

	.c-checklist__item {
		margin: 0 0 1.5rem 0;
	}

	.c-tag {
		margin-bottom: 0.5rem;
	}

	.c-title__group {
		display: grid;
		grid-template-columns: 40px 1fr;
		gap: 10px;
		align-items: center;
	}

	.c-title {
		font-size: 17.25px;
		margin: 0;
		font-weight: 700;
		line-height: 1.3;
	}

	.c-title__link {
		text-decoration: underline;
		text-underline-position: below;
	}

	.c-title__link:hover,
	.c-title__link:focus {
		text-decoration: none;
	}

	.c-paragraph {
		margin: 0 0 1rem 0;
	}

	.c-paragraph__spaced {
		margin: 0 0 2rem 0;
	}

	.c-bold {
		font-weight: 700;;
	}

	.c-circle {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		border: 2px solid currentColor;
		height: 32px;
		width: 32px;
		border-radius: 100%;
		font-weight: 700;
		font-size: 16px;
	}

	.c-circle--failed {
		border-color: #d42054;
	}

	.c-circle--incomplete {
		border-color: #f79c37;
	}

	.c-circle--passed {
		border-color: #1C824A;
	}

	/* The default Umbraco font Lato renders differently between operating systems, so we are using the system default to vertically align */
	.c-circle__text {
		margin-top: 3px;
	}

	.mac .c-circle__text {
		margin-top: 0;
	}

	.c-incident-number {
		display: flex;
		align-items: center;
		justify-content: center;
		border: 1px solid currentColor;
		height: 24px;
		width: 24px;
		border-radius: 100%;
		font-weight: 700;
		font-size: 14px;
	}

	.c-incident-number--serious,
	.c-incident-number--critical {
		border-color: #d42054;
	}

	.c-incident-number--moderate {
		border-color: #fad634;
	}

	.c-incident-number__text {
		margin-top: 2px;
	}

	.mac .c-incident-number__text {
		margin-top: 0;
	}

	/* Fix Umbraco Colors */

	.umb-sub-views-nav-item .badge.-type-alert {
		background-color: #d42054;
	}

	.c-uui-tag--positive {
		background-color: #1C824A;
	}

	/* Dashboard */

	.c-dashboard-grid {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		gap: 24px;
		margin-bottom: 1rem;
	}

	.c-dashboard-grid__full-row {
		grid-column: 1 / 4;
	}

	.c-dashboard-grid__23 {
		grid-column: 2 / 4;
	}

	.c-dashboard-number {
		font-size: 5rem;
		line-height: 1;
		text-align: center;
		font-weight: bold;
		margin: 2rem 0 0 0;
	}

	.c-dashboard-number__info {
		font-size: 1rem;
		text-align: center;
		font-weight: bold;
		margin: 1rem 0 0 0;
	}

	.c-detail-button--active {
		pointer-events: all;
	}

	.c-test-container {
		width: 100%;
		min-height: 800px;
		margin-top: 1rem;
	}

	.u-mb20 {
		margin-bottom: 20px;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border-width: 0;
	}
	
  `;