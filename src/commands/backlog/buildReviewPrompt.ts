import { buildCommentLines } from "./buildCommentLines";
import type { BacklogItem } from "./types";

export function buildReviewPrompt(
	item: BacklogItem,
	phaseNumber: number,
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
		"If you need to modify backlog items, run `assist backlog --help` to discover available commands.",
		"For each criterion, inspect the code and report PASS or FAIL with a brief explanation:",
		"",
		acLines,
		...buildCommentLines(item.comments),
		"",
		"If any criterion fails, fix the issue and re-verify.",
		`If a criterion still fails after fixing, use \`assist backlog rewind ${item.id} <phase> --reason "<reason>"\` to return to the appropriate phase instead of using phase-done.`,
		"",
		`Post concise comments for any notable findings or changes using \`assist backlog comment ${item.id} "<text>"\`.`,
		"",
		"After all criteria pass, ask the user to confirm any manual checks",
		"(e.g. end-to-end behaviour they need to verify themselves).",
		"Wait for the user to confirm before proceeding.",
		"",
		"Once the user confirms:",
		"1. Run: /commit",
		`2. Run: assist backlog done ${item.id} "<summary>"`,
		`3. Run: assist backlog phase-done ${item.id} ${phaseNumber} "done"`,
	]
		.filter((line) => line !== undefined)
		.join("\n");
}
