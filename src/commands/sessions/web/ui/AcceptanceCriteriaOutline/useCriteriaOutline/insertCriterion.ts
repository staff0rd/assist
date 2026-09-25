import type { CriteriaEdit } from "../CriteriaEdit";
import { normaliseDepths } from "../../normaliseDepths";
import type { AcceptanceCriterion } from "../../splitAcceptanceCriteria";

export function insertCriterion(
	items: AcceptanceCriterion[],
	index: number,
	head: string,
	tail: string,
): CriteriaEdit {
	const depth = items[index]?.depth ?? 0;
	const kept = items.map((item, i) =>
		i === index ? { ...item, text: head } : item,
	);
	return {
		items: normaliseDepths([
			...kept.slice(0, index + 1),
			{ text: tail, depth },
			...kept.slice(index + 1),
		]),
		index: index + 1,
	};
}
