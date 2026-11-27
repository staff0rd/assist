import { reviewHandledMarker } from "./reviewHandledMarker";

type ReviewRef = { id: number; user: string; html_url: string };

export function buildReviewReplyBody(review: ReviewRef, body: string): string {
	return `Re: [review by ${review.user}](${review.html_url})\n\n${body.trim()}\n\n${reviewHandledMarker(review.id)}`;
}
