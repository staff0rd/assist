import type { HighLevelReviewDraft } from "../types";
import type { StoredHighLevelProgress } from "./StoredHighLevelProgress";
import { toStoredHighLevelProgress } from "./toStoredHighLevelProgress";

type StoredComment = StoredHighLevelProgress["reviewComments"][number];

const commentKey = (comment: StoredComment): string =>
	JSON.stringify([
		comment.path,
		comment.startLine,
		comment.endLine,
		comment.startSide ?? "RIGHT",
		comment.side ?? "RIGHT",
		comment.note,
	]);

export function mergeHighLevelDrafts(
	into: StoredHighLevelProgress | undefined,
	drafts: HighLevelReviewDraft[],
): StoredHighLevelProgress {
	const newestFirst = [...drafts].sort((a, b) =>
		b.savedAt.localeCompare(a.savedAt),
	);
	const [base, ...rest] = [
		...(into ? [into] : []),
		...newestFirst.map((draft) => toStoredHighLevelProgress(draft, draft)),
	];
	if (!base) throw new Error("No high-level progress to merge.");
	const merged = {
		...base,
		items: base.items.map((item) => ({ ...item })),
		reviewComments: [...base.reviewComments],
	};
	const seen = new Set(merged.reviewComments.map(commentKey));
	for (const older of rest) {
		for (const comment of older.reviewComments) {
			if (seen.has(commentKey(comment))) continue;
			seen.add(commentKey(comment));
			merged.reviewComments.push(comment);
		}
		for (const item of older.items) {
			if (!item.comment) continue;
			const current = merged.items.find(
				(candidate) =>
					candidate.id === item.id && candidate.slice === item.slice,
			);
			if (!current) merged.items.push({ ...item, ticked: false });
			else current.comment ??= item.comment;
		}
	}
	return merged;
}
