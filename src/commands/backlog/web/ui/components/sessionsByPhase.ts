import type {
	PhaseRuns,
	PhaseSession,
	PhaseStatus,
	PhaseUsage,
	PlanPhase,
} from "../types";

export const REVIEW_PHASE: PlanPhase = { name: "Review", tasks: [] };

export function reviewPhaseIndex(phases: PlanPhase[]): number {
	return phases.at(-1)?.name === REVIEW_PHASE.name
		? phases.length - 1
		: phases.length;
}

export function phaseStatus(
	index: number,
	currentPhase: number | undefined,
	runs: PhaseRuns = {},
): PhaseStatus {
	if (currentPhase === undefined) return "upcoming";
	const phaseNumber = index + 1;
	if (phaseNumber < currentPhase || runs.donePhases?.includes(phaseNumber))
		return "done";
	const running = runs.runningPhases ?? [];
	if (running.length > 0)
		return running.includes(phaseNumber) ? "current" : "upcoming";
	if (phaseNumber === currentPhase) return "current";
	return "upcoming";
}

export function usageByPhase(
	usage: PhaseUsage[] = [],
): Map<number, PhaseUsage> {
	return new Map(usage.map((u) => [u.phaseIdx, u]));
}

export function sessionsByPhase(
	sessions: PhaseSession[] = [],
): Map<number, PhaseSession[]> {
	const byPhase = new Map<number, PhaseSession[]>();
	for (const s of sessions) {
		const existing = byPhase.get(s.phaseIdx);
		if (existing) existing.push(s);
		else byPhase.set(s.phaseIdx, [s]);
	}
	return byPhase;
}
