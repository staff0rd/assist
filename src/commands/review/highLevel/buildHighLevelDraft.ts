import type { PreviewDecision } from "../../sessions/shared/PreviewDecision";
import { highLevelProgress } from "./highLevelProgress";
import type { HighLevelRecordSubject } from "./HighLevelRecordSubject";
import type { HighLevelReviewDraft } from "./types";

export function buildHighLevelDraft(
	subject: HighLevelRecordSubject,
	decision: PreviewDecision,
): HighLevelReviewDraft {
	const { checks, repo, prNumber, headRef, headSha } = subject;
	return {
		repo,
		prNumber,
		headRef,
		headSha,
		savedAt: new Date().toISOString(),
		...highLevelProgress(checks, decision, subject.slices),
	};
}
