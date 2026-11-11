import type { SlashWord } from "./slashWordAt";

export function replaceSlashWord(
	text: string,
	word: SlashWord,
	name: string,
): { text: string; cursor: number } {
	const inserted = `/${name} `;
	const rest = text.slice(word.end).replace(/^ /, "");
	return {
		text: text.slice(0, word.start) + inserted + rest,
		cursor: word.start + inserted.length,
	};
}
