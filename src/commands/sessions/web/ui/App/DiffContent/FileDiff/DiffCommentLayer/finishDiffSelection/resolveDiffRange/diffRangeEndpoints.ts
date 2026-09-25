import type { ChangeData } from "react-diff-view";
import type { DiffChangeIndex } from "../../buildChangeIndex";

export type DiffRangeEnd = {
	cell: HTMLElement;
	change: ChangeData;
	position: number;
};

function cellOf(node: Node): HTMLElement | null {
	const el = node instanceof Element ? node : node.parentElement;
	return el?.closest<HTMLElement>("[data-change-key]") ?? null;
}

function endAt(
	cell: HTMLElement | null,
	index: DiffChangeIndex,
): DiffRangeEnd | null {
	const key = cell?.getAttribute("data-change-key");
	const position = key == null ? undefined : index.positionByKey.get(key);
	const change = position === undefined ? undefined : index.changes[position];
	return cell && change && position !== undefined
		? { cell, change, position }
		: null;
}

export function diffRangeEndpoints(
	range: Range,
	index: DiffChangeIndex,
): { start: DiffRangeEnd; end: DiffRangeEnd } | null {
	const start = endAt(cellOf(range.startContainer), index);
	if (!start) return null;
	return { start, end: endAt(cellOf(range.endContainer), index) ?? start };
}
