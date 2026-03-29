import type { BacklogItem, PlanPhase } from "./types";

export function buildPhasePrompt(
	item: BacklogItem,
	phaseIndex: number,
	phase: PlanPhase,
): string {
	const tasks = phase.tasks
		.map((t) => {
			let line = `- ${t.task}`;
			if (t.verify) line += ` (verify: ${t.verify})`;
			return line;
		})
		.join("\n");

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
		tasks,
		"",
		"Focus ONLY on this phase. Do not work on other phases.",
		`When you have completed all tasks for this phase, run: assist backlog phase-done ${item.id} ${phaseIndex}`,
		"Then run /verify to check your work.",
	]
		.filter((line) => line !== undefined)
		.join("\n");
}
