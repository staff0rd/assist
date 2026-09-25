import type { AcceptanceCriterion } from "../splitAcceptanceCriteria";

export function subtreeEnd(
	items: AcceptanceCriterion[],
	index: number,
): number {
	let end = index + 1;
	while (end < items.length && items[end].depth > items[index].depth) end += 1;
	return end;
}

export function prevSibling(
	items: AcceptanceCriterion[],
	index: number,
): number {
	const depth = items[index].depth;
	for (let i = index - 1; i >= 0; i -= 1) {
		if (items[i].depth < depth) return -1;
		if (items[i].depth === depth) return i;
	}
	return -1;
}

export function nextSibling(
	items: AcceptanceCriterion[],
	index: number,
): number {
	const end = subtreeEnd(items, index);
	return end < items.length && items[end].depth === items[index].depth
		? end
		: -1;
}
