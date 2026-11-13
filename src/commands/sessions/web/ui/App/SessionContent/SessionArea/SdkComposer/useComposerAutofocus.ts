import { type RefObject, useEffect } from "react";
import { isFocusHeld } from "../../../holdFocus";

export function useComposerAutofocus(
	inputRef: RefObject<HTMLTextAreaElement | null>,
	enabled: boolean,
) {
	useEffect(() => {
		if (enabled && !isFocusHeld()) inputRef.current?.focus();
	}, [inputRef, enabled]);
}
