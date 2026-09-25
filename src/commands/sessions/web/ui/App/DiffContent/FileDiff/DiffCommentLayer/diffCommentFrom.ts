import type { DiffSelection } from "./finishDiffSelection";
import type { DiffComment } from "../../../formatDiffComment";

export function diffCommentFrom(
	path: string,
	selection: DiffSelection,
	note: string,
): DiffComment {
	return {
		path,
		startLine: selection.startLine,
		endLine: selection.endLine,
		quote: selection.quote,
		note,
	};
}
