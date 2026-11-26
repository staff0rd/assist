export type Verdict = "pass" | "fail" | "unsure";

export type StepVerdict = {
	step: number;
	action: string;
	expect: string;
	verdict: Verdict;
	note: string;
	screenshot: string;
	videoOffsetMs?: number;
};
