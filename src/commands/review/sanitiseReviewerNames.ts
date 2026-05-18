const REVIEWER_LABEL = "the reviewer";

export function sanitiseReviewerNames(value: string): string {
	return value
		.replace(/\bclaude\b/gi, REVIEWER_LABEL)
		.replace(/\bopus\b/gi, REVIEWER_LABEL);
}
