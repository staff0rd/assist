import { buildCommentLines } from "./buildCommentLines";
import { formatItemId } from "./formatItemId";
import type { BacklogItem, PlanPhase } from "./types";

export function buildContextLines(
	item: BacklogItem,
	phaseNumber: number,
	phase: PlanPhase,
): string[] {
	const ac = item.acceptanceCriteria.map((c, i) => `${i + 1}. ${c}`).join("\n");
	return [
		`You are implementing phase ${phaseNumber} of backlog item ${formatItemId(item.id)}: ${item.name}`,
		"",
		item.description ? `Description: ${item.description}` : "",
		"",
		"Acceptance criteria:",
		ac,
		...buildCommentLines(item.comments),
		"",
		`Phase ${phaseNumber}: ${phase.name}`,
		"Tasks:",
		formatTasks(phase),
	];
}

function formatTasks(phase: PlanPhase): string {
	return phase.tasks.map((t) => `- ${t.task}`).join("\n");
}
