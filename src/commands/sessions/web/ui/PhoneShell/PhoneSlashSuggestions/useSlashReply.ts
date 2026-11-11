import { useLayoutEffect, useRef, useState } from "react";
import type { SlashCommand } from "../../../slashCommands/readSlashCommands";
import { matchSlashCommands } from "./matchSlashCommands";
import { replaceSlashWord } from "./replaceSlashWord";
import { slashWordAt } from "./slashWordAt";

type Field = HTMLTextAreaElement | HTMLInputElement;

export function useSlashReply(commands: SlashCommand[]) {
	const [text, setText] = useState("");
	const [cursor, setCursor] = useState(0);
	const inputRef = useRef<HTMLTextAreaElement>(null);
	const pendingCursor = useRef<number | null>(null);

	useLayoutEffect(() => {
		const input = inputRef.current;
		if (pendingCursor.current === null || !input) return;
		input.setSelectionRange(pendingCursor.current, pendingCursor.current);
		pendingCursor.current = null;
	}, [text]);

	const word = slashWordAt(text, cursor);
	const matches = word ? matchSlashCommands(commands, word.query) : [];

	const trackCursor = (field: Field) =>
		setCursor(field.selectionEnd ?? field.value.length);

	return {
		text,
		inputRef,
		suggestions:
			word && matches.length > 0 ? { query: word.query, matches } : null,
		edit: (field: Field) => {
			setText(field.value);
			trackCursor(field);
		},
		trackCursor,
		pick: (name: string) => {
			if (!word) return;
			const next = replaceSlashWord(text, word, name);
			pendingCursor.current = next.cursor;
			setText(next.text);
			setCursor(next.cursor);
		},
		clear: () => {
			setText("");
			setCursor(0);
		},
	};
}
