import type { CriteriaEdit } from "../../CriteriaEdit";
import type { CriterionCaret } from "../../CriterionFocus";
import type {
	CriterionKeyAction,
	CriterionKeyEvent,
} from "./CriterionKeyEvent";
import { insertCriterion } from "../insertCriterion";
import { moveCriterion } from "./criterionEditKey/moveCriterion";
import { removeCriterion } from "../removeCriterion";
import { shiftCriterionDepth } from "./criterionEditKey/shiftCriterionDepth";
import type { AcceptanceCriterion } from "../../../splitAcceptanceCriteria";

function edit(
	value: CriteriaEdit | null,
	caret: CriterionCaret,
): CriterionKeyAction | null {
	return value ? { kind: "edit", edit: value, caret } : null;
}

function split(
	items: AcceptanceCriterion[],
	index: number,
	{ caret, text }: CriterionKeyEvent,
): CriterionKeyAction | null {
	const head = text.slice(0, caret);
	return edit(insertCriterion(items, index, head, text.slice(caret)), "start");
}

function reindent(
	items: AcceptanceCriterion[],
	index: number,
	{ shift, caret }: CriterionKeyEvent,
): CriterionKeyAction | null {
	const shifted = shiftCriterionDepth(items, index, shift ? -1 : 1);
	return edit(shifted ? { items: shifted, index } : null, caret);
}

export function criterionEditKey(
	items: AcceptanceCriterion[],
	index: number,
	event: CriterionKeyEvent,
): CriterionKeyAction | null {
	const { key, shift, alt, caret, text } = event;
	if (key === "Enter" && !shift) return split(items, index, event);
	if (key === "Tab") return reindent(items, index, event);
	if (alt && (key === "ArrowUp" || key === "ArrowDown"))
		return edit(moveCriterion(items, index, key === "ArrowUp" ? -1 : 1), caret);
	if (key === "Backspace" && caret === 0 && text === "")
		return edit(removeCriterion(items, index), "end");
	return null;
}
