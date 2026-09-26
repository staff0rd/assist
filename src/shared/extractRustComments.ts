import type { ExtractedComment } from "./ExtractedComment";
import { lineCounter } from "./lineCounter";
import { readRustComment } from "./readRustComment";
import { skipRustLiteral } from "./skipRustLiteral";

export function extractRustComments(content: string): ExtractedComment[] {
	const comments: ExtractedComment[] = [];
	const lineOf = lineCounter(content);
	let index = 0;

	while (index < content.length) {
		const comment = readRustComment(content, index);
		if (comment) {
			comments.push({ line: lineOf(index), text: comment.text });
			index = comment.end;
		} else index = skipRustLiteral(content, index) ?? index + 1;
	}

	return comments;
}
