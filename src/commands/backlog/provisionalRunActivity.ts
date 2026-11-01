import type { Activity } from "../../shared/emitActivity";
import { backlogPhaseActivity } from "./backlogPhaseActivity";
import { resolvePlan } from "./resolvePlan";
import type { BacklogItem } from "./types";

export function provisionalRunActivity(
	item: BacklogItem,
): Omit<Activity, "startedAt"> | undefined {
	if (item.status === "done") return undefined;
	const plan = resolvePlan(item);
	const startPhase = (item.currentPhase ?? 1) - 1;
	if (startPhase < 0 || startPhase > plan.length) return undefined;
	return backlogPhaseActivity(
		item,
		startPhase + 1,
		plan.length + 1,
		plan[startPhase]?.name ?? "",
	);
}
