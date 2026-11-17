import type {
	HighLevelPaneProgress,
	HighLevelProgressHead,
	StoredHighLevelProgress,
} from "./StoredHighLevelProgress";

export function toStoredHighLevelProgress(
	head: HighLevelProgressHead,
	progress: HighLevelPaneProgress,
): StoredHighLevelProgress {
	return {
		repo: head.repo,
		prNumber: head.prNumber,
		updatedAt: new Date().toISOString(),
		items: progress.items.map((item) => ({
			id: item.id,
			ticked: item.ticked === true,
			...(item.comment ? { comment: item.comment } : {}),
			...(item.slice !== undefined ? { slice: item.slice } : {}),
			headSha: head.headSha,
		})),
		reviewComments: (progress.reviewComments ?? []).map((comment) => ({
			...comment,
			headSha: comment.headSha ?? head.headSha,
		})),
	};
}
