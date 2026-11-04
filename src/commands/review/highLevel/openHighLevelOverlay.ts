import { randomUUID } from "node:crypto";
import { awaitPreviewApproval } from "../../sessions/shared/awaitPreviewApproval";
import { buildHighLevelDraft } from "./buildHighLevelDraft";
import { buildHighLevelRecord } from "./buildHighLevelRecord";
import { clearHighLevelDraft } from "./clearHighLevelDraft";
import { discardHighLevelProgress } from "./discardHighLevelProgress";
import { saveHighLevelDraft } from "./saveHighLevelDraft";
import { highLevelPreviewMetadata } from "./highLevelPreviewMetadata";
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
	const decision = await awaitPreviewApproval(
		"High-level review",
		{
			sessionId,
			requestId: randomUUID(),
			title: `${subject.repo}#${subject.prNumber} — ${subject.title}`,
			body: JSON.stringify(highLevelPreviewPayload(subject)),
			prNumber: subject.prNumber,
			kind: "high-level-review",
			metadata: highLevelPreviewMetadata(subject),
		},
		{ rejectIsOutcome: true },
	);
	if (decision.restart) {
		discardHighLevelProgress(subject.repo, subject.headRef, subject.headSha);
		await onRestart();
		return undefined;
	}
	if (decision.dismissed) {
		saveHighLevelDraft(buildHighLevelDraft(subject, decision));
		console.log(
			"Review closed without a verdict. Your progress is kept for when you reopen it; nothing was posted.",
		);
		return undefined;
	}
	const record = buildHighLevelRecord(subject, decision);
	saveHighLevelReview(record);
	clearHighLevelDraft(record.repo, record.headRef, record.headSha);
	console.log(`Verdict: ${record.verdict}`);
	submitHighLevelReview(record);
	return record;
}
