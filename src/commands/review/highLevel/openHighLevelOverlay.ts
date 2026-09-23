import { randomUUID } from "node:crypto";
import { awaitPreviewApproval } from "../../sessions/shared/awaitPreviewApproval";
import { buildHighLevelRecord } from "./buildHighLevelRecord";
import { highLevelPreviewMetadata } from "./highLevelPreviewMetadata";
import { highLevelPreviewPayload } from "./highLevelPreviewPayload";
import type { HighLevelOverlaySubject } from "./HighLevelOverlaySubject";
import { saveHighLevelReview } from "./saveHighLevelReview";
import type { HighLevelReviewRecord } from "./types";

export async function openHighLevelOverlay(
	sessionId: string,
	subject: HighLevelOverlaySubject,
): Promise<HighLevelReviewRecord> {
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
	const record = buildHighLevelRecord(subject, decision);
	const path = saveHighLevelReview(record);
	console.log(`Verdict: ${record.verdict}`);
	console.log(`Saved ${path}`);
	console.log("Nothing was posted to GitHub.");
	return record;
}
