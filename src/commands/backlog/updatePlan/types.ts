export type DiffPhase = {
	name: string;
	tasks: string[];
	manualChecks: string[];
	/** 1-based, only when it differs from the previous phase. */
	dependsOn?: number[];
};

type PlanPhaseChange = "unchanged" | "added" | "edited" | "moved";

export type PlanDiffPhase = {
	phase: DiffPhase;
	change: PlanPhaseChange;
	previousPosition?: number;
	previousName?: string;
	previousTasks?: string[];
	wasCompleted: boolean;
};

export type PlanDiffRemovedPhase = {
	phase: DiffPhase;
	previousPosition: number;
	wasCompleted: boolean;
};

export type PlanDiff = {
	phases: PlanDiffPhase[];
	removed: PlanDiffRemovedPhase[];
};
