import type { BacklogItem } from "./types";

export function buildReviewPrompt(
	item: BacklogItem,
	phaseIndex: number,
): string {
	const acLines = item.acceptanceCriteria
		.map((ac, i) => `${i + 1}. ${ac}`)
		.join("\n");

	return [
		`You are reviewing backlog item #${item.id}: ${item.name}`,
		"",
		item.description ? `Description: ${item.description}` : "",
		"",
		"This is the auto-generated review phase. Verify each acceptance criterion against the current implementation.",
		"For each criterion, inspect the code and report PASS or FAIL with a brief explanation:",
		"",
		acLines,
		"",
		"If any criterion fails, fix the issue and re-verify before proceeding.",
		"",
		"After all criteria pass, ask the user to confirm any manual checks",
		"(e.g. end-to-end behaviour they need to verify themselves).",
		"Wait for the user to confirm before proceeding.",
		"",
		"Once the user confirms:",
		`1. Run: assist backlog done ${item.id}`,
		"2. Run: /commit",
		`3. Run: assist backlog phase-done ${item.id} ${phaseIndex}`,
	]
		.filter((line) => line !== undefined)
		.join("\n");
}
