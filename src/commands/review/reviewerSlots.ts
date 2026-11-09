import type { ReviewPaths } from "./buildReviewPaths";
import { type ReviewerHarness, reviewerHarnesses } from "./reviewerHarnesses";

export type ReviewerSlot = {
	name: string;
	harness: ReviewerHarness;
	outputPath: string;
};

export function reviewerSlots(paths: ReviewPaths): ReviewerSlot[] {
	const outputPaths: Record<ReviewerHarness, string> = {
		claude: paths.claudePath,
		codex: paths.codexPath,
	};
	return reviewerHarnesses.map((harness) => ({
		name: harness,
		harness,
		outputPath: outputPaths[harness],
	}));
}
