import { buildReviewCheckLines } from "./buildReviewCheckLines";
import { buildReviewConfirmLines } from "./buildReviewConfirmLines";
import { buildReviewCompletionLines } from "./buildReviewCompletionLines";
import { buildReviewIntroLines } from "./buildReviewIntroLines";
import { formatItemId } from "./formatItemId";
import type { BacklogItem } from "./types";

export function buildReviewPrompt(
	item: BacklogItem,
	phaseNumber: number,
	options: {
		commitBeforePhaseEnd: boolean;
		askCheck?: boolean;
		manualChecks?: string[];
		yolo?: boolean;
	} = {
		commitBeforePhaseEnd: false,
	},
): string {
	const itemId = formatItemId(item.id);

	return [
		...buildReviewIntroLines(item, itemId),
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
		...buildReviewConfirmLines(
			options.yolo === true && options.askCheck === true,
		),
		"",
		...buildReviewCompletionLines(
			itemId,
			phaseNumber,
			item.comments,
			options.yolo === true,
		),
	]
		.filter((line) => line !== undefined)
		.join("\n");
}
