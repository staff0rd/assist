export type SlashWord = { start: number; end: number; query: string };

export function slashWordAt(text: string, cursor: number): SlashWord | null {
	const before = text.slice(0, cursor);
	const start = before.search(/\S*$/);
	if (start === cursor || text[start] !== "/") return null;
	const after = text.slice(cursor).match(/^\S*/)?.[0] ?? "";
	return {
		start,
		end: cursor + after.length,
		query: text.slice(start + 1, cursor),
	};
}
