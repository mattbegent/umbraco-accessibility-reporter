import { UmbModalToken } from "@umbraco-cms/backoffice/modal";
import IResults from "../../Interface/IResults";

export interface StatementModalData {
    results: IResults;
    averagePageScore: number;
    totalViolations: number;
    numberOfPagesTested: number;
    pagesTestResults: Array<{ name: string; url: string; score: number; violations: number }>;
}

export interface StatementModalValue {
}

export const ACCESSIBILITY_REPORTER_STATEMENT_MODAL = new UmbModalToken<StatementModalData, StatementModalValue>(
    'AccessibilityReporter.Modal.Statement',
    {
        modal: {
            type: 'sidebar',
            size: 'full'
        }
    }
);
