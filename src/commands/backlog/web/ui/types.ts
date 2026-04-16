type PlanTask = {
	task: string;
};

export type PlanPhase = {
	name: string;
	tasks: PlanTask[];
	manualChecks?: string[];
};

export type BacklogComment = {
	id?: number;
	text: string;
	phase?: number;
	timestamp: string;
	type: "comment" | "summary";
};

export type PhaseStatus = "done" | "current" | "upcoming";

export type BacklogItem = {
	id: number;
	type: "story" | "bug";
	name: string;
	description?: string;
	acceptanceCriteria: string[];
	plan?: PlanPhase[];
	currentPhase?: number;
	status: "todo" | "in-progress" | "done" | "wontdo";
	comments?: BacklogComment[];
};
