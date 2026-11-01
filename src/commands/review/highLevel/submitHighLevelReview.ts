import type { PreviewReviewEvent } from "../../sessions/shared/PreviewDecision";
import { formatHighLevelReviewBody } from "./formatHighLevelReviewBody";
import {
	type HighLevelReviewSubmission,
	postHighLevelReview,
} from "./postHighLevelReview";
import type { HighLevelReviewRecord } from "./types";
import { splitQueuedComments } from "./splitQueuedComments";

const EVENTS: Record<HighLevelReviewRecord["verdict"], PreviewReviewEvent> = {
	approve: "APPROVE",
	comment: "COMMENT",
	"request-changes": "REQUEST_CHANGES",
};

export function submitHighLevelReview(record: HighLevelReviewRecord): void {
	const { lineLevel, remainder } = splitQueuedComments(record);
	const submission: HighLevelReviewSubmission = {
		event: EVENTS[record.verdict],
		body: formatHighLevelReviewBody(record.items, remainder),
		comments: lineLevel,
	};
	const hasContent = submission.body || lineLevel.length > 0;
	if (submission.event !== "APPROVE" && !hasContent) {
		console.log("Nothing was posted to GitHub.");
		return;
	}
	const target = `${record.repo}#${record.prNumber}`;
	try {
		postHighLevelReview(record.repo, record.prNumber, submission);
	} catch (error) {
		console.error(
			`Could not post the review to ${target}: ${(error as Error).message}`,
		);
		process.exit(1);
	}
	console.log(`Review (${submission.event}) posted to ${target}.`);
}
