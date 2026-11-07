export type PatternToken = string | PatternToken[];

function readString(text: string, start: number): [string, number] {
	const quote = text[start];
	let value = "";
	let i = start + 1;
	while (i < text.length && text[i] !== quote) {
		if (text[i] === "\\") i++;
		value += text[i];
		i++;
	}
	return [value, i + 1];
}

export function readPatternList(
	text: string,
	start: number,
): [PatternToken[], number] {
	const items: PatternToken[] = [];
	let i = start + 1;
	while (i < text.length && text[i] !== "]") {
		const ch = text[i];
		if (ch === '"' || ch === "'") {
			const [value, next] = readString(text, i);
			items.push(value);
			i = next;
		} else if (ch === "[") {
			const [list, next] = readPatternList(text, i);
			items.push(list);
			i = next;
		} else i++;
	}
	return [items, i + 1];
}
