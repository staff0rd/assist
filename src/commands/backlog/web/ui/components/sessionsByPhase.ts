import type {
	PhaseSession,
	PhaseStatus,
	PhaseUsage,
	PlanPhase,
} from "../types";

export const REVIEW_PHASE: PlanPhase = { name: "Review", tasks: [] };

export function phaseStatus(
	index: number,
	currentPhase: number | undefined,
): PhaseStatus {
	if (currentPhase === undefined) return "upcoming";
	const phaseNumber = index + 1;
	if (phaseNumber < currentPhase) return "done";
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
