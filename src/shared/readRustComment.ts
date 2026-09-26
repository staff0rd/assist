import { readCsharpComment } from "./readCsharpComment";

function blockCommentEnd(content: string, index: number): number {
	let depth = 0;
	let cursor = index;
	while (cursor < content.length) {
		const pair = content.slice(cursor, cursor + 2);
		if (pair === "/*") {
			depth++;
			cursor += 2;
		} else if (pair === "*/") {
			cursor += 2;
			if (--depth === 0) return cursor;
		} else cursor++;
	}
	return content.length;
}

export function readRustComment(
	content: string,
	index: number,
): { end: number; text: string } | undefined {
	if (!content.startsWith("/*", index))
		return readCsharpComment(content, index);
	const end = blockCommentEnd(content, index);
	return { end, text: content.slice(index, end) };
}
