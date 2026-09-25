import type { CriteriaEdit } from "../CriteriaEdit";
import { normaliseDepths } from "../../normaliseDepths";
import type { AcceptanceCriterion } from "../../splitAcceptanceCriteria";
import { subtreeEnd } from "../subtreeEnd";

export function dropCriterion(
	items: AcceptanceCriterion[],
	from: number,
	target: number,
	depth: number,
): CriteriaEdit {
	const end = subtreeEnd(items, from);
	const shift = depth - items[from].depth;
	const block = items
		.slice(from, end)
		.map((item) => ({ ...item, depth: Math.max(0, item.depth + shift) }));
	const rest = [...items.slice(0, from), ...items.slice(end)];
	const at = target > from ? target - block.length : target;
	return {
		items: normaliseDepths([...rest.slice(0, at), ...block, ...rest.slice(at)]),
		index: at,
	};
}
