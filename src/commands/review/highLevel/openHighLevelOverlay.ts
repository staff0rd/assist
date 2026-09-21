import { randomUUID } from "node:crypto";
import { awaitPreviewApproval } from "../../sessions/shared/awaitPreviewApproval";
import { buildHighLevelRecord } from "./buildHighLevelRecord";
import { highLevelChangedFileCount } from "./highLevelChangedFileCount";
import { saveHighLevelReview } from "./saveHighLevelReview";
import type {
	HighLevelCheckResult,
	HighLevelCriticalDiff,
	HighLevelPreviewPayload,
	HighLevelReviewRecord,
	HighLevelStructure,
} from "./types";

export type HighLevelOverlaySubject = {
	repo: string;
	prNumber: number;
	headRef: string;
	headSha: string;
	checks: HighLevelCheckResult[];
	structure: HighLevelStructure;
	criticalDiffs: HighLevelCriticalDiff[];
	criticalPaths: string[];
	saved?: HighLevelReviewRecord;
};

function payloadOf(subject: HighLevelOverlaySubject): HighLevelPreviewPayload {
	const { checks, structure, criticalDiffs, criticalPaths, saved } = subject;
	return {
		checks,
		structure,
		criticalDiffs,
		criticalPaths,
		...(saved ? { saved } : {}),
	};
}

function metadataOf(subject: HighLevelOverlaySubject) {
	return [
		{ label: "Branch", value: subject.headRef },
		{ label: "Head", value: subject.headSha.slice(0, 7) },
		{
			label: "Changed files",
			value: String(highLevelChangedFileCount(subject.structure)),
		},
		{ label: "Critical files", value: String(subject.criticalDiffs.length) },
		...(subject.saved
			? [{ label: "Reopened from", value: subject.saved.reviewedAt }]
			: []),
	];
}

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
			body: JSON.stringify(payloadOf(subject)),
			prNumber: subject.prNumber,
			kind: "high-level-review",
			metadata: metadataOf(subject),
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
