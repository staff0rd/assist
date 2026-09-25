import type { DiffChangeIndex } from "./buildChangeIndex";
import {
	type Caret,
	type OverlayRect,
	overlayRects,
} from "../../../caretFromPoint";
import { type CellOrigin, cellOrigin } from "./cellOrigin";
import { snappedRange } from "../../../finishSelection";
import { resolveDiffRange } from "./finishDiffSelection/resolveDiffRange";
import type { SelectedChange } from "./selectedChanges";
import type { SelectionAnchor } from "../../../SelectionCommentPopover";

export type DiffSelection = SelectionAnchor & {
	startLine: number;
	endLine: number;
	changes: SelectedChange[];
	moved: boolean;
	origin: (CellOrigin & { key: string }) | null;
	rects: OverlayRect[];
};

export function finishDiffSelection(
	anchor: Caret,
	focus: Caret,
	wrapper: HTMLElement,
	index: DiffChangeIndex,
): DiffSelection | null {
	const range = snappedRange(anchor, focus);
	const resolved = resolveDiffRange(range, index);
	if (!resolved) return null;
	const rect = range.getBoundingClientRect();
	const key = resolved.changes[0]?.key;
	const origin = key ? cellOrigin(wrapper, key) : null;
	return {
		...resolved,
		top: rect.bottom,
		left: rect.left,
		moved: false,
		origin: key && origin ? { key, ...origin } : null,
		rects: overlayRects(range, wrapper),
	};
}
