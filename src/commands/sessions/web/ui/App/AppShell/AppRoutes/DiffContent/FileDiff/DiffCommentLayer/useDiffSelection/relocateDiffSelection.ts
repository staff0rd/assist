import type { DiffChangeIndex } from "../buildChangeIndex";
import type { OverlayRect } from "../../../../caretFromPoint";
import { cellOrigin } from "../cellOrigin";
import type { DiffSelection } from "../finishDiffSelection";
import type { SelectedChange } from "../selectedChanges";

function stillPresent(
	changes: SelectedChange[],
	index: DiffChangeIndex,
): boolean {
	return changes.every(({ key, content }) => {
		const position = index.positionByKey.get(key);
		return (
			position !== undefined && index.changes[position]?.content === content
		);
	});
}

function shifted(
	rects: OverlayRect[],
	top: number,
	left: number,
): OverlayRect[] {
	return rects.map((rect) => ({
		...rect,
		top: rect.top + top,
		left: rect.left + left,
	}));
}

export function relocateDiffSelection(
	selection: DiffSelection,
	index: DiffChangeIndex,
	wrapper: HTMLElement | null,
): DiffSelection {
	if (selection.moved) return selection;
	if (!stillPresent(selection.changes, index))
		return { ...selection, moved: true, rects: [] };
	if (!wrapper || !selection.origin) return selection;

	const origin = cellOrigin(wrapper, selection.origin.key);
	if (!origin) return selection;

	const top = origin.top - selection.origin.top;
	const left = origin.left - selection.origin.left;
	if (top === 0 && left === 0) return selection;

	return {
		...selection,
		origin: { key: selection.origin.key, ...origin },
		top: selection.top + top,
		left: selection.left + left,
		rects: shifted(selection.rects, top, left),
	};
}
