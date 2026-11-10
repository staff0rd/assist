import { expandFromRawCode, type HunkData } from "react-diff-view";
import { GAP_STEP, type GapDirection, gapAt } from "../../gapAt";

function indexHeadByOldLine(headLines: string[], newMinusOld: number) {
	return newMinusOld >= 0
		? headLines.slice(newMinusOld)
		: [...Array<string>(-newMinusOld).fill(""), ...headLines];
}

function revealedRange(
	start: number,
	end: number,
	direction: GapDirection,
): [number, number] {
	if (direction === "down") return [start, Math.min(start + GAP_STEP, end)];
	if (direction === "up") return [Math.max(end - GAP_STEP, start), end];
	return [start, end];
}

export function expandGap(
	hunks: HunkData[],
	headLines: string[],
	index: number,
	direction: GapDirection,
): HunkData[] {
	const gap = gapAt(hunks, index, headLines.length);
	if (!gap || gap.end === null) return hunks;
	const [from, to] = revealedRange(gap.start, gap.end, direction);
	return expandFromRawCode(
		hunks,
		indexHeadByOldLine(headLines, gap.offset),
		from,
		to,
	);
}
