import { type SyntheticEvent, useCallback, useRef } from "react";
import type { DraftFocus } from "../useNewSessionDraft";

export function useDraftFocus(
	focus: DraftFocus,
	setFocus: (focus: DraftFocus) => void,
) {
	const initial = useRef(focus);
	const promptEl = useRef<HTMLTextAreaElement | null>(null);
	const repoRef = useRef<HTMLInputElement>(null);
	const modeRef = useRef<HTMLDivElement>(null);

	const promptRef = useCallback((el: HTMLTextAreaElement | null) => {
		promptEl.current = el;
		const { field, selectionStart, selectionEnd } = initial.current;
		if (el && field === "prompt")
			el.setSelectionRange(selectionStart, selectionEnd);
	}, []);

	const trackPrompt = (e: SyntheticEvent) => {
		const el = e.target as HTMLTextAreaElement;
		setFocus({
			field: "prompt",
			selectionStart: el.selectionStart,
			selectionEnd: el.selectionEnd,
		});
	};

	const restore = () => {
		if (modeRef.current?.closest("form")?.contains(document.activeElement))
			return;
		const { field } = initial.current;
		if (field === "repo") repoRef.current?.focus();
		else if (field === "mode")
			modeRef.current
				?.querySelector<HTMLElement>('[aria-checked="true"]')
				?.focus();
		else promptEl.current?.focus();
	};

	return {
		autoFocus: focus.field,
		promptRef,
		repoRef,
		modeRef,
		trackPrompt,
		trackRepo: () => setFocus({ ...focus, field: "repo" }),
		trackMode: () => setFocus({ ...focus, field: "mode" }),
		restore,
	};
}
