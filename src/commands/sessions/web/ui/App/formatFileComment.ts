import { formatDiffComment } from "./formatDiffComment";
import { formatQuotedComment } from "./formatQuotedComment";
import type { QuoteLines } from "./locateQuoteLines";

export type FileComment = {
	path: string;
	lines: QuoteLines | null;
	quote: string;
	note: string;
};

export function formatFileComment({
	path,
	lines,
	quote,
	note,
}: FileComment): string {
	if (!lines) return `${path}\n\n${formatQuotedComment(quote, note)}`;
	return formatDiffComment({
		path,
		startLine: lines.start,
		endLine: lines.end,
		quote,
		note,
	});
}
