import { useState } from "react";
import type { SlashCommand } from "../../../slashCommands/readSlashCommands";
import { useSlashSuggestions } from "../../slashSuggestions/useSlashSuggestions";

export function useSlashReply(commands: SlashCommand[]) {
	const [text, setText] = useState("");
	const slash = useSlashSuggestions(commands, text, setText);
	return {
		text,
		inputRef: slash.inputRef,
		suggestions: slash.suggestions,
		edit: slash.edit,
		trackCursor: slash.trackCursor,
		pick: slash.pick,
		clear: () => setText(""),
		fill: (value: string) => {
			setText(value);
			slash.inputRef.current?.focus();
		},
	};
}
