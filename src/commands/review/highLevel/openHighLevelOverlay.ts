import { randomUUID } from "node:crypto";
import { awaitPreviewApproval } from "../../sessions/shared/awaitPreviewApproval";
import { buildHighLevelRecord } from "./buildHighLevelRecord";
import { discardHighLevelProgress } from "./discardHighLevelProgress";
import { highLevelPreviewMetadata } from "./highLevelPreviewMetadata";
import { highLevelProgress } from "./highLevelProgress";
import { clearHighLevelProgress } from "./progressStore/clearHighLevelProgress";
import { saveHighLevelProgress } from "./progressStore/saveHighLevelProgress";
import { highLevelPreviewPayload } from "./highLevelPreviewPayload";
import type { HighLevelOverlaySubject } from "./HighLevelOverlaySubject";
import { saveHighLevelReview } from "./saveHighLevelReview";
import { submitHighLevelReview } from "./submitHighLevelReview";
import type { HighLevelReviewRecord } from "./types";

export async function openHighLevelOverlay(
	sessionId: string,
	subject: HighLevelOverlaySubject,
	onRestart: () => Promise<void> = async () => {},
): Promise<HighLevelReviewRecord | undefined> {
	const requestId = randomUUID();
	const decision = await awaitPreviewApproval(
		"High-level review",
		{
			sessionId,
			requestId,
			title: `${subject.repo}#${subject.prNumber} — ${subject.title}`,
			body: JSON.stringify(highLevelPreviewPayload(subject)),
			prNumber: subject.prNumber,
			kind: "high-level-review",
			metadata: highLevelPreviewMetadata(subject),
		},
		{ rejectIsOutcome: true },
	);
	if (decision.restart) {
		discardHighLevelProgress(subject, requestId);
		await onRestart();
		return undefined;
	}
	if (decision.dismissed) {
		if (decision.checklist)
			saveHighLevelProgress(
				subject,
				highLevelProgress(subject.checks, decision, subject.slices),
			);
		console.log(
			"Review closed without a verdict. Your progress is kept for when you reopen it; nothing was posted.",
		);
		return undefined;
	}
	const record = buildHighLevelRecord(subject, decision);
	saveHighLevelReview(record);
	clearHighLevelProgress(record.repo, record.prNumber, "verdict", requestId);
	console.log(`Verdict: ${record.verdict}`);
	submitHighLevelReview(record);
	return record;
}
