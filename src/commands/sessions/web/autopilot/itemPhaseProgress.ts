import { authoredPhases } from "../../../backlog/authoredPhases";
import type { BacklogItem } from "../../../backlog/types";
import type { AutopilotItemView } from "./AutopilotItemView";

function isDone(item: BacklogItem, phaseNumber: number): boolean {
	if (item.status === "done") return true;
	return (
		phaseNumber < (item.currentPhase ?? 1) ||
		(item.donePhases ?? []).includes(phaseNumber)
	);
}

export function itemPhaseProgress(
	item: BacklogItem,
): Pick<
	AutopilotItemView,
	"phase" | "totalPhases" | "donePhases" | "remaining"
> {
	const phases = authoredPhases(item.plan ?? []).map((p, i) => ({
		number: i + 1,
		name: p.name,
	}));
	const phase = item.runningPhases?.[0] ?? item.currentPhase ?? 1;
	const pending = phases.filter(
		(p) => !isDone(item, p.number) && p.number !== phase,
	);
	return {
		phase,
		totalPhases: phases.length,
		donePhases: phases.filter((p) => isDone(item, p.number)).length,
		remaining:
			item.status === "done"
				? []
				: [...pending, { number: null, name: "Review" }],
	};
}
