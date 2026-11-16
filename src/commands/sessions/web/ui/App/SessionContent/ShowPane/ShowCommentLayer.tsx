import type { ReactNode } from "react";
import type { PrPreview } from "../../../../../shared/SessionInfoBase";
import { QuestionCommentLayer } from "../../QuestionCommentLayer";
import type { HighLevelDiffComments } from "../PrPreviewSlideInPane/HighLevelDiffComments";
import { showCommentFrom } from "./ShowCommentLayer/showCommentFrom";

export function ShowCommentLayer({
	preview,
	comments,
	children,
}: {
	preview: PrPreview;
	comments: HighLevelDiffComments;
	children: ReactNode;
}) {
	return (
		<QuestionCommentLayer
			path="Shown content"
			comments={comments}
			build={(quote, note) => showCommentFrom(preview, quote, note)}
		>
			{children}
		</QuestionCommentLayer>
	);
}
