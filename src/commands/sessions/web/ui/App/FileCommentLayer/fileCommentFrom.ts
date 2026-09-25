import type { FileComment } from "../formatFileComment";
import { locateQuoteLines } from "../locateQuoteLines";
import type { PendingComment } from "../PendingComment";

export function fileCommentFrom(
	path: string,
	source: string,
	selection: PendingComment,
	note: string,
): FileComment {
	return {
		path,
		lines: locateQuoteLines(source, selection.quote),
		quote: selection.quote,
		note,
	};
}
