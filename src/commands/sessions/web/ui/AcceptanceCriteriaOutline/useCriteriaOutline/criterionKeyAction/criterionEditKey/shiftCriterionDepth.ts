import type { AcceptanceCriterion } from "../../../../splitAcceptanceCriteria";
import { prevSibling, subtreeEnd } from "../../../subtreeEnd";

export function shiftCriterionDepth(
	items: AcceptanceCriterion[],
	index: number,
	delta: number,
): AcceptanceCriterion[] | null {
	if (delta < 0 && items[index].depth === 0) return null;
	if (delta > 0 && prevSibling(items, index) < 0) return null;
	const end = subtreeEnd(items, index);
	return items.map((item, i) =>
		i >= index && i < end ? { ...item, depth: item.depth + delta } : item,
	);
}
