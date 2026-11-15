export type PhasesResult =
	| { kind: "completed" }
	| { kind: "fail" }
	| { kind: "paused" };
