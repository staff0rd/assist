import { buildCommentLines } from "./buildCommentLines";
import type { BacklogItem } from "./types";

export function buildReviewIntroLines(
	item: BacklogItem,
	itemId: string,
): string[] {
	const acLines = item.acceptanceCriteria
		.map((ac, i) => `${i + 1}. ${ac}`)
		.join("\n");
	return [
		`You are reviewing backlog item ${itemId}: ${item.name}`,
		"",
		item.description ? `Description:\n${item.description}` : "",
		"",
		"This is the auto-generated review phase. Verify each acceptance criterion against the current implementation.",
		"If you need to modify backlog items, run `assist backlog --help` to discover available commands.",
		"For each criterion, inspect the code and report PASS or FAIL with a brief explanation:",
		"",
		acLines,
		...buildCommentLines(item.comments),
		"",
		"If any criterion fails, fix the issue and re-verify.",
		"",
		`Post concise comments for any notable findings or changes using \`assist backlog comment ${itemId} "<text>"\`.`,
		"",
	];
}
