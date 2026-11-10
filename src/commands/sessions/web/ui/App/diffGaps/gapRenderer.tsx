import type { HighLevelForeignHunk } from "../../../../../review/highLevel/types";
import { elsewhereInGap } from "./gapRenderer/elsewhereInGap";
import { gapAt } from "./gapAt";
import { GapExpander } from "./gapRenderer/GapExpander";
import type { GapExpansion } from "./useGapExpansion";

export function gapRenderer(
	{ hunks, headLength, expandable, from, loading, error, expand }: GapExpansion,
	elsewhere: HighLevelForeignHunk[] = [],
) {
	return (index: number) => {
		const found = gapAt(hunks, index, headLength);
		if (!found) return null;
		const note = elsewhereInGap(elsewhere, found);
		if (!expandable && !note) return null;
		const gap = expandable ? found : { ...found, directions: [] };
		return (
			<GapExpander
				key={`gap-${hunks[index]?.content ?? "end"}`}
				gap={gap}
				header={hunks[index]?.content}
				from={from}
				elsewhere={note}
				disabled={loading !== null}
				loading={loading === index}
				error={error?.index === index ? error.message : undefined}
				onExpand={(direction) => expand(index, direction)}
				onRetry={() => error && expand(error.index, error.direction)}
			/>
		);
	};
}
