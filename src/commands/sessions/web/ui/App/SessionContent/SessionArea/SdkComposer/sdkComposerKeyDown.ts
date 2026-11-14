import type { KeyboardEvent } from "react";
import type { useSlashSuggestions } from "../../../../slashSuggestions/useSlashSuggestions";
import { backslashLineBreak } from "./backslashLineBreak";

type SdkComposerKeys = {
	slash: ReturnType<typeof useSlashSuggestions>;
	suggestion: string | undefined;
	running: boolean;
	send: () => void;
	stop: () => void;
};

export function sdkComposerKeyDown(
	e: KeyboardEvent,
	{ slash, suggestion, running, send, stop }: SdkComposerKeys,
): void {
	if (slash.onKeyDown(e)) return;
	if (e.key === "Tab" && suggestion && !e.shiftKey) {
		e.preventDefault();
		slash.replace({ text: suggestion, cursor: suggestion.length });
	} else if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
		e.preventDefault();
		const field = slash.inputRef.current;
		const lineBreak = field && backslashLineBreak(field);
		if (lineBreak) slash.replace(lineBreak);
		else send();
	} else if (e.key === "Escape" && running) {
		e.preventDefault();
		stop();
	}
}
