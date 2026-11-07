import { offsetsToRange } from "../../../../../../rangeToOffsets";
import { wrapRange } from "./applyHighlights/wrapRange";

type ColoredOffsets = {
	start: number;
	end: number;
	color: string;
	pin?: string;
};

export function clearHighlights(root: HTMLElement): void {
	for (const mark of root.querySelectorAll("mark.pr-comment")) {
		if (!mark.parentNode) continue;
		while (mark.firstChild) mark.before(mark.firstChild);
		mark.remove();
	}
}

export function applyHighlights(
	root: HTMLElement,
	ranges: ColoredOffsets[],
): void {
	for (const offsets of ranges) {
		const range = offsetsToRange(root, offsets);
		if (range) wrapRange(root, range, offsets);
	}
}
