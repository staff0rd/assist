import type { ReviewComment } from "../types";
import type { Style } from "./commentStyle";
import { firstLine } from "./firstLine";

export function renderHandledReviewIndex(
	reviews: ReviewComment[],
	style: Style,
): string {
	const lines = [style.cyan(`Handled reviews (${reviews.length})`)];
	for (const review of reviews) {
		lines.push(
			`  ${style.bold(review.user)} ${style.dim(`id ${review.id}`)}: ${firstLine(review.body)}`,
		);
	}
	lines.push("");
	return lines.join("\n");
}
