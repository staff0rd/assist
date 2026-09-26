import { buildCommentLines } from "./buildCommentLines";
import { formatItemId } from "./formatItemId";
import type { BacklogItem, PlanPhase } from "./types";
import { buildManualCheckLines } from "./buildManualCheckLines";
import { buildJiraStartedLines } from "./buildJiraStartedLines";

export function buildAuthoredPhasePrompt(
	item: BacklogItem,
	phaseNumber: number,
	phase: PlanPhase,
	options: { commitBeforePhaseEnd: boolean; crossRepo?: boolean } = {
		commitBeforePhaseEnd: false,
	},
): string {
	const manualChecks = phase.manualChecks ?? [];
	const needsConfirmation = manualChecks.length > 0;
	const confirmSuffix = needsConfirmation ? " and the user confirms" : "";

	return [
		...buildContextLines(item, phaseNumber, phase),
		...buildJiraStartedLines(item, phaseNumber),
		"",
		"Focus ONLY on this phase. Do not work on other phases.",
		options.crossRepo
			? undefined
			: "Work only in this item's own repo. Do not modify, commit or push any other repo without the user's explicit permission — if a task needs changes elsewhere, stop and ask the user to file that work as a separate item in that repo's backlog.",
		"If you need to modify backlog items, run `assist backlog --help` to discover available commands.",
		"When you have completed all tasks for this phase, run /verify to check your work.",
		...buildManualCheckLines(manualChecks, options.commitBeforePhaseEnd),
		"",
		`Post concise comments for any notable findings or changes using \`assist backlog comment ${formatItemId(item.id)} "<text>"\`.`,
		"",
		`Once verify passes${confirmSuffix}, run: assist backlog phase-done ${formatItemId(item.id)} ${phaseNumber} "<summary>"`,
		"Replace <summary> with a concise summary of what was done in this phase.",
	]
		.filter((line) => line !== undefined)
		.join("\n");
}

function buildContextLines(
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
