import type { PreviewDecision } from "../../sessions/shared/PreviewDecision";
import { indexHighLevelTests } from "./indexHighLevelTests";
import type {
	HighLevelCheckResult,
	HighLevelReviewItem,
	HighLevelReviewRecord,
	HighLevelTestComment,
	HighLevelTestFile,
} from "./types";

type RecordSubject = {
	repo: string;
	prNumber: number;
	headRef: string;
	headSha: string;
	checks: HighLevelCheckResult[];
	tests: HighLevelTestFile[];
};

type TestIndex = ReturnType<typeof indexHighLevelTests>;

function testComments(
	notes: { id: string; comment: string }[],
	tests: TestIndex,
): HighLevelTestComment[] {
	return notes.flatMap(({ id, comment }) => {
		const test = tests.get(id);
		const trimmed = comment.trim();
		return test && trimmed ? [{ id, ...test, comment: trimmed }] : [];
	});
}

function toItem(
	check: HighLevelCheckResult,
	decision: PreviewDecision,
	tests: TestIndex,
): HighLevelReviewItem {
	const ticked = decision.checklist?.find((entry) => entry.id === check.id);
	const comment = ticked?.comment?.trim();
	const notes = testComments(ticked?.notes ?? [], tests);
	return {
		id: check.id,
		kind: check.kind,
		title: check.title,
		status: check.status,
		reason: check.reason,
		ticked: ticked?.ticked ?? check.status === "pass",
		...(comment ? { comment } : {}),
		...(notes.length > 0 ? { testComments: notes } : {}),
	};
}

export function buildHighLevelRecord(
	subject: RecordSubject,
	decision: PreviewDecision,
): HighLevelReviewRecord {
	const { checks, repo, prNumber, headRef, headSha } = subject;
	const tests = indexHighLevelTests(subject.tests);
	return {
		repo,
		prNumber,
		headRef,
		headSha,
		verdict: decision.decision === "approve" ? "approve" : "request-changes",
		reviewedAt: new Date().toISOString(),
		items: checks.map((check) => toItem(check, decision, tests)),
	};
}
