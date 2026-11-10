import type { HunkData } from "react-diff-view";
import type { GapDirection } from "../gapAt";
import { expandGap } from "./expandedFrom/expandGap";

export type Expanded = { base: HunkData[]; hunks: HunkData[] };

export function expandedFrom(
	previous: Expanded | null,
	base: HunkData[],
	lines: string[],
	index: number,
	direction: GapDirection,
): Expanded {
	return {
		base,
		hunks: expandGap(
			previous?.base === base ? previous.hunks : base,
			lines,
			index,
			direction,
		),
	};
}
