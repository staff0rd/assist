import type { CriteriaEdit } from "../CriteriaEdit";
import { normaliseDepths } from "../../normaliseDepths";
import type { AcceptanceCriterion } from "../../splitAcceptanceCriteria";
import { subtreeEnd } from "../subtreeEnd";

export function removeCriterion(
	items: AcceptanceCriterion[],
	index: number,
): CriteriaEdit {
	const end = subtreeEnd(items, index);
	const kept = items
		.map((item, i) =>
			i > index && i < end ? { ...item, depth: item.depth - 1 } : item,
		)
		.filter((_, i) => i !== index);
	return { items: normaliseDepths(kept), index: Math.max(0, index - 1) };
}
