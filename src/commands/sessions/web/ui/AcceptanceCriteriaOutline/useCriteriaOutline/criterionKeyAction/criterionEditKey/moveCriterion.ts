import type { CriteriaEdit } from "../../../CriteriaEdit";
import type { AcceptanceCriterion } from "../../../../splitAcceptanceCriteria";
import { nextSibling, prevSibling, subtreeEnd } from "../../../subtreeEnd";

export function moveCriterion(
	items: AcceptanceCriterion[],
	index: number,
	delta: number,
): CriteriaEdit | null {
	const sibling =
		delta < 0 ? prevSibling(items, index) : nextSibling(items, index);
	if (sibling < 0) return null;
	const end = subtreeEnd(items, index);
	const block = items.slice(index, end);
	const rest = [...items.slice(0, index), ...items.slice(end)];
	const at = delta < 0 ? sibling : subtreeEnd(items, sibling) - (end - index);
	return {
		items: [...rest.slice(0, at), ...block, ...rest.slice(at)],
		index: at,
	};
}
