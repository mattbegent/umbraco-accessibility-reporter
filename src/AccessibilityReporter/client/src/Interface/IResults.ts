import IPageResult from "./IPageResult";

interface IResults {
	startTime: Date;
	endTime: Date;
	pages: IPageResult[];
}

export default IResults;