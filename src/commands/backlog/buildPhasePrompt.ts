import type { BacklogItem, PlanPhase } from "./types";

function formatTasks(phase: PlanPhase): string {
	return phase.tasks
		.map((t) => {
			let line = `- ${t.task}`;
			if (t.verify) line += ` (verify: ${t.verify})`;
			return line;
		})
		.join("\n");
}

function buildManualCheckLines(
	manualChecks: string[],
	isLastPhase: boolean,
): string[] {
	if (manualChecks.length > 0) {
		return [
			"",
			"Before marking this phase as done, ask the user to perform these manual checks:",
			...manualChecks.map((c) => `- ${c}`),
			"",
			"Wait for the user to confirm all manual checks pass before proceeding.",
		];
	}
	if (isLastPhase) {
		return [
			"",
			"This is the final phase. Before marking it as done, ask the user to manually verify",
			"that the feature works end-to-end and all acceptance criteria are met.",
			"Wait for the user to confirm before proceeding.",
		];
	}
	return [];
}

function buildContextLines(
	item: BacklogItem,
	phaseIndex: number,
	phase: PlanPhase,
): string[] {
	const ac = item.acceptanceCriteria.map((c) => `- ${c}`).join("\n");
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

export function buildPhasePrompt(
	item: BacklogItem,
	phaseIndex: number,
	phase: PlanPhase,
	totalPhases: number,
): string {
	const isLastPhase = phaseIndex === totalPhases - 1;
	const manualChecks = phase.manualChecks ?? [];
	const needsConfirmation = manualChecks.length > 0 || isLastPhase;
	const confirmSuffix = needsConfirmation ? " and the user confirms" : "";

	return [
		...buildContextLines(item, phaseIndex, phase),
		"",
		"Focus ONLY on this phase. Do not work on other phases.",
		"When you have completed all tasks for this phase, run /verify to check your work.",
		...buildManualCheckLines(manualChecks, isLastPhase),
		"",
		`Once verify passes${confirmSuffix}, run: assist backlog phase-done ${item.id} ${phaseIndex}`,
	]
		.filter((line) => line !== undefined)
		.join("\n");
}
