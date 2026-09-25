import { useEffect, useRef } from "react";
import { caretOffset } from "./useCriterionFocus/caretOffset";
import type { CriterionFocus } from "../CriterionFocus";

export function useCriterionFocus(focus: CriterionFocus | null) {
	const fieldRef = useRef<HTMLTextAreaElement | null>(null);

	useEffect(() => {
		const field = fieldRef.current;
		if (!focus || !field) return;
		field.focus();
		const at = caretOffset(focus.caret, field.value.length);
		field.setSelectionRange(at, at);
	}, [focus]);

	return fieldRef;
}
