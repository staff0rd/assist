import { reviewerHarnesses, reviewerNameWords } from "./reviewerHarnesses";

const REVIEWER_LABEL = "the reviewer";

const NAME_PATTERNS = reviewerHarnesses
	.flatMap((harness) => reviewerNameWords[harness])
	.map((word) => new RegExp(`\\b${word}\\b`, "gi"));

export function sanitiseReviewerNames(value: string): string {
	return NAME_PATTERNS.reduce(
		(text, pattern) => text.replace(pattern, REVIEWER_LABEL),
		value,
	);
}
