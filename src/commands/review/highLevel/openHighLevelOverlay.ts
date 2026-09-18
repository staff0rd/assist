import { randomUUID } from "node:crypto";
import { awaitPreviewApproval } from "../../sessions/shared/awaitPreviewApproval";
import { buildHighLevelRecord } from "./buildHighLevelRecord";
import { saveHighLevelReview } from "./saveHighLevelReview";
import type { HighLevelCheckResult, HighLevelReviewRecord } from "./types";

export type HighLevelOverlaySubject = {
	repo: string;
	prNumber: number;
	headRef: string;
	headSha: string;
	changedFileCount: number;
	checks: HighLevelCheckResult[];
};

export async function openHighLevelOverlay(
	sessionId: string,
	subject: HighLevelOverlaySubject,
): Promise<HighLevelReviewRecord> {
	const decision = await awaitPreviewApproval(
		"High-level review",
		{
			sessionId,
			requestId: randomUUID(),
			title: `High-level review of ${subject.repo}#${subject.prNumber}`,
			body: JSON.stringify(subject.checks),
			prNumber: subject.prNumber,
			kind: "high-level-review",
			metadata: [
				{ label: "Branch", value: subject.headRef },
				{ label: "Head", value: subject.headSha.slice(0, 7) },
				{ label: "Changed files", value: String(subject.changedFileCount) },
			],
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
