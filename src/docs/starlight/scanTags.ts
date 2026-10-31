export type Tag = { start: number; end: number; name: string; close: boolean };

const TAG =
	/<!--[\s\S]*?-->|<(\/?)([a-zA-Z][\w:-]*)(?:"[^"]*"|'[^']*'|[^'">])*>/g;

const VOID = new Set([
	"area",
	"base",
	"br",
	"col",
	"embed",
	"hr",
	"img",
	"input",
	"link",
	"meta",
	"source",
	"track",
	"wbr",
]);

export function scanTags(value: string): Tag[] {
	const tags: Tag[] = [];
	for (const match of value.matchAll(TAG)) {
		const name = match[2]?.toLowerCase();
		if (!name || VOID.has(name) || match[0].endsWith("/>")) continue;
		const start = match.index ?? 0;
		tags.push({ start, end: start + match[0].length, name, close: !!match[1] });
	}
	return tags;
}
