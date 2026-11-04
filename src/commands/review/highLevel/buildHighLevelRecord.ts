import type { PreviewDecision } from "../../sessions/shared/PreviewDecision";
import { highLevelProgress } from "./highLevelProgress";
import { highLevelReviewEvent } from "./highLevelReviewEvent";
import type { HighLevelRecordSubject } from "./HighLevelRecordSubject";
import type { HighLevelReviewRecord } from "./types";

const VERDICTS = {
	APPROVE: "approve",
	COMMENT: "comment",
	REQUEST_CHANGES: "request-changes",
} as const;

export function buildHighLevelRecord(
	subject: HighLevelRecordSubject,
	decision: PreviewDecision,
): HighLevelReviewRecord {
	const { checks, repo, prNumber, headRef, headSha } = subject;
	return {
		repo,
		prNumber,
		headRef,
		headSha,
		verdict: VERDICTS[highLevelReviewEvent(decision)],
		reviewedAt: new Date().toISOString(),
		...highLevelProgress(checks, decision, subject.slices),
	};
}
