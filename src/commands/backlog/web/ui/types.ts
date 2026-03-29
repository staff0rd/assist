type PlanTask = {
	task: string;
	verify?: string;
};

export type PlanPhase = {
	name: string;
	tasks: PlanTask[];
	manualChecks?: string[];
};

export type BacklogItem = {
	id: number;
	type: "story" | "bug";
	name: string;
	description?: string;
	acceptanceCriteria: string[];
	plan?: PlanPhase[];
	currentPhase?: number;
	status: "todo" | "in-progress" | "done";
};
