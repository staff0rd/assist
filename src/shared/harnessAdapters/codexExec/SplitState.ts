type OpenStatement = {
	start: number;
	header: boolean;
	headerDone: boolean;
	body: "none" | "block" | "simple";
};

export type SplitState = {
	src: string;
	spans: { start: number; end: number }[];
	depth: number;
	last: number;
	open: OpenStatement | null;
};
