import ITestPage from "./ITestPage";
import IViolationPreview from "./IViolationPreview";

interface IPageResult {
	violations: IViolationPreview[];
	score: number;
	page: ITestPage;
}

export default IPageResult;