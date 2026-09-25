import { type KeyboardEvent, useState } from "react";
import type { CriteriaEdit } from "./CriteriaEdit";
import type { CriterionCaret, CriterionFocus } from "./CriterionFocus";
import { criterionKeyAction } from "./useCriteriaOutline/criterionKeyAction";
import { insertCriterion } from "./useCriteriaOutline/insertCriterion";
import { removeCriterion } from "./useCriteriaOutline/removeCriterion";
import type { AcceptanceCriterion } from "../splitAcceptanceCriteria";

export function useCriteriaOutline(
	items: AcceptanceCriterion[],
	onChange: (items: AcceptanceCriterion[]) => void,
) {
	const [focus, setFocus] = useState<CriterionFocus | null>(null);

	const apply = (edit: CriteriaEdit | null, caret: CriterionCaret) => {
		if (!edit) return;
		onChange(edit.items);
		setFocus({ index: edit.index, caret });
	};

	const onKeyDown = (
		index: number,
		event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		const field = event.currentTarget;
		if (event.key === "Enter" || event.key === "Tab") event.preventDefault();
		const action = criterionKeyAction(items, index, {
			key: event.key,
			shift: event.shiftKey,
			alt: event.altKey,
			caret: field.selectionStart ?? 0,
			text: field.value,
		});
		if (!action) return;
		event.preventDefault();
		if (action.kind === "focus")
			setFocus({ index: action.index, caret: "end" });
		else apply(action.edit, action.caret);
	};

	return {
		focus,
		onKeyDown,
		onDrop: (edit: CriteriaEdit) => apply(edit, "end"),
		onText: (index: number, text: string) =>
			onChange(
				items.map((item, i) => (i === index ? { ...item, text } : item)),
			),
		onAdd: (index: number) =>
			apply(insertCriterion(items, index, items[index].text, ""), "start"),
		onDelete: (index: number) => apply(removeCriterion(items, index), "end"),
	};
}
