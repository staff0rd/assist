import type { PrPreview } from "../../../../../../shared/SessionInfoBase";
import type { DiffComment } from "../../../formatDiffComment";
import { locateQuoteLines } from "../../../locateQuoteLines";

export function showCommentFrom(
	preview: Pick<PrPreview, "title" | "body">,
	quote: string,
	question: string,
): DiffComment {
	const at = locateQuoteLines(preview.body, quote);
	return {
		path: `Shown "${preview.title}"`,
		startLine: at?.start ?? 1,
		endLine: at?.end ?? 1,
		quote,
		note: `Question about content you showed (answer it; this is not a decision on the preview): ${question}`,
	};
}
