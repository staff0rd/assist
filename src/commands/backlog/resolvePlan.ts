import type { BacklogItem, PlanPhase } from "./types";

export function resolvePlan(item: BacklogItem): PlanPhase[] {
	if (item.plan && item.plan.length > 0) {
		return item.plan;
	}
	return [
		{
			name: "Implement",
			tasks: item.acceptanceCriteria.map((ac) => ({ task: ac })),
		},
	];
}
