import type { HighLevelHunk } from "./listHighLevelHunks";
import type { HighLevelSlice } from "./types";

export function sliceTotals(
	refs: string[],
	byRef: Map<string, HighLevelHunk>,
): Pick<HighLevelSlice, "additions" | "deletions"> {
	let additions = 0;
	let deletions = 0;
	for (const ref of refs) {
		const hunk = byRef.get(ref);
		additions += hunk?.additions ?? 0;
		deletions += hunk?.deletions ?? 0;
	}
	return { additions, deletions };
}
