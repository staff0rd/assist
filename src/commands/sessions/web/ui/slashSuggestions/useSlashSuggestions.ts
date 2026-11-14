import { type KeyboardEvent, useState } from "react";
import type { SlashCommand } from "../../slashCommands/readSlashCommands";
import { findSlashMatches } from "./findSlashMatches";
import { handleSlashKey } from "./handleSlashKey";
import { replaceSlashWord } from "./replaceSlashWord";
import { usePendingCursor } from "./usePendingCursor";
import { useSlashListNav } from "./useSlashListNav";

type Field = HTMLTextAreaElement | HTMLInputElement;

export function useSlashSuggestions(
	commands: SlashCommand[],
	value: string,
	onChange: (value: string) => void,
) {
	const [cursor, setCursor] = useState(0);
	const { inputRef, placeCursor, isPlacing } = usePendingCursor(value);
	const found = findSlashMatches(commands, value, cursor);
	const matches = found?.matches ?? [];
	const nav = useSlashListNav(found?.key ?? "", matches.length);
	const open = matches.length > 0 && !nav.dismissed;

	const trackCursor = (field: Field) => {
		// React fires onSelect after an inserting keydown, still reading the pre-insert caret.
		if (!isPlacing()) setCursor(field.selectionEnd ?? field.value.length);
	};

	const replace = (next: { text: string; cursor: number }) => {
		placeCursor(next.cursor);
		setCursor(next.cursor);
		onChange(next.text);
	};

	const pick = (name: string) => {
		if (found) replace(replaceSlashWord(value, found.word, name));
	};

	const onKeyDown = (e: KeyboardEvent) =>
		open && handleSlashKey(e, nav, () => pick(matches[nav.highlight].name));

	return {
		inputRef,
		suggestions:
			open && found
				? { query: found.word.query, matches, highlight: nav.highlight }
				: null,
		edit: (field: Field) => {
			onChange(field.value);
			trackCursor(field);
		},
		trackCursor,
		replace,
		pick,
		onKeyDown,
	};
}
