import { buildCommentLines } from "./buildCommentLines";
import { buildReviewCheckLines } from "./buildReviewCheckLines";
import { buildReviewCompletionLines } from "./buildReviewCompletionLines";
import { formatItemId } from "./formatItemId";
import type { BacklogItem } from "./types";

export function buildReviewPrompt(
	item: BacklogItem,
	phaseNumber: number,
	options: {
		commitBeforePhaseEnd: boolean;
		askCheck?: boolean;
		manualChecks?: string[];
	} = {
		commitBeforePhaseEnd: false,
	},
): string {
	const acLines = item.acceptanceCriteria
		.map((ac, i) => `${i + 1}. ${ac}`)
		.join("\n");
	const itemId = formatItemId(item.id);

	return [
		`You are reviewing backlog item ${itemId}: ${item.name}`,
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
		"",
		`Post concise comments for any notable findings or changes using \`assist backlog comment ${itemId} "<text>"\`.`,
		"",
		...(options.commitBeforePhaseEnd
			? [
					"Before asking the user to confirm manual checks, run /commit to commit the work (it is fine if there is nothing new to commit).",
					"",
				]
			: []),
		...buildReviewCheckLines(
			options.manualChecks ?? [],
			options.askCheck === true,
		),
		"After all criteria pass, ask the user to confirm any manual checks",
		"(e.g. end-to-end behaviour they need to verify themselves).",
		"Wait for the user to confirm before proceeding.",
		"",
		...buildReviewCompletionLines(itemId, phaseNumber),
	]
		.filter((line) => line !== undefined)
		.join("\n");
}
