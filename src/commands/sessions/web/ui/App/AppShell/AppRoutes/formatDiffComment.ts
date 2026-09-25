import { formatQuotedComment } from "./formatQuotedComment";

export type DiffComment = {
	path: string;
	startLine: number;
	endLine: number;
	quote: string;
	note: string;
};

export function formatDiffComment({
	path,
	startLine,
	endLine,
	quote,
	note,
}: DiffComment): string {
	const lines =
		startLine === endLine ? `${startLine}` : `${startLine}-${endLine}`;
	return `${path}:${lines}\n\n${formatQuotedComment(quote, note)}`;
}
