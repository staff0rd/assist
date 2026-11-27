import type { ReviewComment } from "../types";
import type { Style } from "./commentStyle";
import { renderHandledReviewIndex } from "./renderHandledReviewIndex";
import { renderReview } from "./renderReview";

export function printReviews(
	reviews: ReviewComment[],
	style: Style,
): { unhandled: number; handled: number } {
	const unhandled = reviews.filter((r) => !r.handled);
	const handled = reviews.filter((r) => r.handled);
	for (const review of unhandled) {
		console.log(renderReview(review, style));
	}
	if (handled.length > 0) {
		console.log(renderHandledReviewIndex(handled, style));
	}
	return { unhandled: unhandled.length, handled: handled.length };
}
