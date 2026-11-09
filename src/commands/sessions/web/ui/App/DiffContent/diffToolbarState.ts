import type { useDiffContent } from "./useDiffContent";

type DiffContentState = ReturnType<typeof useDiffContent>;

export function diffToolbarState(diff: DiffContentState) {
	return {
		...diff.filters,
		...diff.treePanel,
		...diff.collapseAll,
		scope: diff.scopeState,
		totals: diff.totals,
		commentHint: diff.comments.unavailable,
	};
}
