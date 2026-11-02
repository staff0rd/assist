import type { HighLevelForeignHunk } from "../../../../../../../review/highLevel/types";
import { gapRenderer } from "./gapRenderer";
import type { GapExpansion } from "./useGapExpansion";

export function diffGapRenderer(
	expansion: GapExpansion,
	elsewhere: HighLevelForeignHunk[] = [],
) {
	return expansion.expandable || elsewhere.length > 0
		? gapRenderer(expansion, elsewhere)
		: undefined;
}
