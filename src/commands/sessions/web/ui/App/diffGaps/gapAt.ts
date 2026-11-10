import { type HunkData, isNormal } from "react-diff-view";

export const GAP_STEP = 20;

const GITHUB_PATCH_CONTEXT_LINES = 3;

export type GapDirection = "all" | "down" | "up";

export type Gap = {
	start: number;
	end: number | null;
	offset: number;
	directions: GapDirection[];
};

function reachesEndOfFile({ changes }: HunkData) {
	const trailing = [...changes].reverse().findIndex((c) => !isNormal(c));
	return trailing < GITHUB_PATCH_CONTEXT_LINES;
}

function endOfFile(last: HunkData, offset: number, headLength?: number) {
	if (headLength !== undefined) return headLength - offset + 1;
	return reachesEndOfFile(last) ? last.oldStart + last.oldLines : null;
}

function directionsFor(
	hidden: number | null,
	hasAbove: boolean,
	hasBelow: boolean,
): GapDirection[] {
	if (!hasBelow) return ["down"];
	if (hidden !== null && hidden <= GAP_STEP) return ["all"];
	return hasAbove ? ["down", "up"] : ["up"];
}

function gapEnd(
	previous: HunkData | undefined,
	next: HunkData | undefined,
	offset: number,
	headLength: number | undefined,
) {
	if (next) return next.oldStart;
	return previous ? endOfFile(previous, offset, headLength) : 1;
}

export function gapAt(
	hunks: HunkData[],
	index: number,
	headLength?: number,
): Gap | null {
	const previous = hunks[index - 1];
	const next = hunks[index];
	const start = previous ? previous.oldStart + previous.oldLines : 1;
	const offset = previous ? previous.newStart + previous.newLines - start : 0;
	const end = gapEnd(previous, next, offset, headLength);
	if (end !== null && end <= start) return null;
	return {
		start,
		end,
		offset,
		directions: directionsFor(
			end === null ? null : end - start,
			previous !== undefined,
			next !== undefined,
		),
	};
}
