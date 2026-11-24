import type { KeyboardEvent } from "react";
import type { useSlashSuggestions } from "../../../../slashSuggestions/useSlashSuggestions";
import { backslashLineBreak } from "./backslashLineBreak";
import { isPlainArrowUp } from "./isPlainArrowUp";
import { acceptsSuggestion } from "./acceptsSuggestion";

type SdkComposerKeys = {
	slash: ReturnType<typeof useSlashSuggestions>;
	suggestion: string | undefined;
	running: boolean;
	send: () => void;
	stop: () => void;
	stopShell: (() => void) | undefined;
	recallQueued: (() => void) | undefined;
};

export function sdkComposerKeyDown(
	e: KeyboardEvent,
	{
		slash,
		suggestion,
		running,
		send,
		stop,
		stopShell,
		recallQueued,
	}: SdkComposerKeys,
): void {
	if (slash.onKeyDown(e)) return;
	if (suggestion && acceptsSuggestion(e)) {
		e.preventDefault();
		slash.replace({ text: suggestion, cursor: suggestion.length });
	} else if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
		e.preventDefault();
		const field = slash.inputRef.current;
		const lineBreak = field && backslashLineBreak(field);
		if (lineBreak) slash.replace(lineBreak);
		else send();
	} else if (recallQueued && isPlainArrowUp(e)) {
		e.preventDefault();
		recallQueued();
	} else if (e.key === "Escape" && stopShell) {
		e.preventDefault();
		stopShell();
	} else if (e.key === "Escape" && running) {
		e.preventDefault();
		stop();
	}
}
