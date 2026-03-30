import type { BacklogItem, PlanPhase } from "./types";

export function buildAuthoredPhasePrompt(
	item: BacklogItem,
	phaseIndex: number,
	phase: PlanPhase,
): string {
	const manualChecks = phase.manualChecks ?? [];
	const needsConfirmation = manualChecks.length > 0;
	const confirmSuffix = needsConfirmation ? " and the user confirms" : "";

	return [
		...buildContextLines(item, phaseIndex, phase),
		"",
		"Focus ONLY on this phase. Do not work on other phases.",
		"When you have completed all tasks for this phase, run /verify to check your work.",
		...buildManualCheckLines(manualChecks),
		"",
		`You can run \`assist backlog comments ${item.id}\` to read prior phase notes and comments.`,
		`Post concise comments for any notable findings or changes using \`assist backlog comment ${item.id} "<text>"\`.`,
		"",
		`Once verify passes${confirmSuffix}, run: assist backlog phase-done ${item.id} ${phaseIndex} "<summary>"`,
		"Replace <summary> with a concise summary of what was done in this phase.",
	]
		.filter((line) => line !== undefined)
		.join("\n");
}

function buildContextLines(
	item: BacklogItem,
	phaseIndex: number,
	phase: PlanPhase,
): string[] {
	const ac = item.acceptanceCriteria.map((c, i) => `${i + 1}. ${c}`).join("\n");
	return [
		`You are implementing phase ${phaseIndex + 1} of backlog item #${item.id}: ${item.name}`,
		"",
		item.description ? `Description: ${item.description}` : "",
		"",
		"Acceptance criteria:",
		ac,
		"",
		`Phase ${phaseIndex + 1}: ${phase.name}`,
		"Tasks:",
		formatTasks(phase),
	];
}

function buildManualCheckLines(manualChecks: string[]): string[] {
	if (manualChecks.length > 0) {
		return [
			"",
			"Before marking this phase as done, ask the user to perform these manual checks:",
			...manualChecks.map((c) => `- ${c}`),
			"",
			"Wait for the user to confirm all manual checks pass before proceeding.",
		];
	}
	return [];
}

function formatTasks(phase: PlanPhase): string {
	return phase.tasks
		.map((t) => {
			let line = `- ${t.task}`;
			if (t.verify) line += ` (verify: ${t.verify})`;
			return line;
		})
		.join("\n");
}
