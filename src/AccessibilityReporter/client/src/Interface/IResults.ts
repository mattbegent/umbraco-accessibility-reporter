import IPageResult from "./IPageResult";

interface IResults {
	startTime: Date;
	endTime: Date;
	pages: IPageResult[];
	culture?: string;
}

export default IResults;