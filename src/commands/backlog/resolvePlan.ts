import { authoredPhases } from "./authoredPhases";
import type { BacklogItem, PlanPhase } from "./types";

export function resolvePlan(item: BacklogItem): PlanPhase[] {
	const authored = authoredPhases(item.plan ?? []);
	if (authored.length > 0) {
		return authored;
	}
	return [
		{
			name: "Implement",
			tasks: item.acceptanceCriteria.map((ac) => ({ task: ac })),
		},
	];
}
