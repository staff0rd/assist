import type {
	CriterionKeyAction,
	CriterionKeyEvent,
} from "./criterionKeyAction/CriterionKeyEvent";
import { criterionArrowFocus } from "./criterionKeyAction/criterionArrowFocus";
import { criterionEditKey } from "./criterionKeyAction/criterionEditKey";
import type { AcceptanceCriterion } from "../../splitAcceptanceCriteria";

export function criterionKeyAction(
	items: AcceptanceCriterion[],
	index: number,
	event: CriterionKeyEvent,
): CriterionKeyAction | null {
	return (
		criterionEditKey(items, index, event) ??
		criterionArrowFocus(items, index, event)
	);
}
