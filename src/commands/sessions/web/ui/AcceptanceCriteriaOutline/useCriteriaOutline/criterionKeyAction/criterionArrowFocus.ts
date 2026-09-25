import type {
	CriterionKeyAction,
	CriterionKeyEvent,
} from "./CriterionKeyEvent";
import type { AcceptanceCriterion } from "../../../splitAcceptanceCriteria";

export function criterionArrowFocus(
	items: AcceptanceCriterion[],
	index: number,
	{ key, shift, alt, caret, text }: CriterionKeyEvent,
): CriterionKeyAction | null {
	if (alt || shift) return null;
	if (key === "ArrowUp" && caret === 0 && index > 0)
		return { kind: "focus", index: index - 1 };
	if (key === "ArrowDown" && caret === text.length && index < items.length - 1)
		return { kind: "focus", index: index + 1 };
	return null;
}
