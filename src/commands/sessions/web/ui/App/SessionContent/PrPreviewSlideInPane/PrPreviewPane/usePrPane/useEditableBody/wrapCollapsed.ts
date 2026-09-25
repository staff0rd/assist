const SUMMARY = "<summary>Click to expand</summary>";

function plainText(markdown: string): string {
	return markdown
		.replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
		.replace(/[^\p{L}\p{N}]+/gu, " ")
		.trim();
}

function tightestWindow(
	normalized: string[],
	needle: string,
): [number, number] | null {
	let best: [number, number] | null = null;
	for (let start = 0; start < normalized.length; start += 1) {
		let text = "";
		for (let end = start; end < normalized.length; end += 1) {
			const line = normalized[end];
			if (line) text = text ? `${text} ${line}` : line;
			if (!text.includes(needle)) continue;
			if (!best || end - start < best[1] - best[0]) best = [start, end];
			break;
		}
	}
	return best;
}

export function wrapCollapsed(markdown: string, quote: string): string {
	const needle = plainText(quote);
	if (!needle) return markdown;

	const lines = markdown.split("\n");
	const window = tightestWindow(lines.map(plainText), needle);
	if (!window) return markdown;

	const [start, end] = window;
	return [
		...lines.slice(0, start),
		"<details>",
		SUMMARY,
		"",
		...lines.slice(start, end + 1),
		"",
		"</details>",
		...lines.slice(end + 1),
	].join("\n");
}
