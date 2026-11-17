import { migrateHighLevelDrafts } from "./migrateHighLevelDrafts";
import { readStoredHighLevelProgress } from "./readStoredHighLevelProgress";
import type { HighLevelPaneProgress } from "./StoredHighLevelProgress";

export function loadHighLevelProgress(
	repo: string,
	prNumber: number,
	headSha: string,
): HighLevelPaneProgress | undefined {
	migrateHighLevelDrafts(repo, prNumber);
	const stored = readStoredHighLevelProgress(repo, prNumber);
	if (
		!stored ||
		(stored.items.length === 0 && stored.reviewComments.length === 0)
	)
		return undefined;
	return {
		updatedAt: stored.updatedAt,
		items: stored.items.flatMap(({ headSha: madeOn, ...item }) => {
			if (madeOn === headSha) return [item];
			const { ticked: _stale, ...carried } = item;
			return carried.comment ? [carried] : [];
		}),
		reviewComments: stored.reviewComments,
	};
}
