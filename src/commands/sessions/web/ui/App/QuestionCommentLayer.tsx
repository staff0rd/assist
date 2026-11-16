import type { ReactNode } from "react";
import type { DiffComment } from "./formatDiffComment";
import type { HighLevelDiffComments } from "./SessionContent/PrPreviewSlideInPane/HighLevelDiffComments";
import { SelectionCommentLayer } from "./SelectionCommentLayer";
import { selectionActions } from "./selectionActions";
import { usePreviewSelection } from "./usePreviewSelection";

export function QuestionCommentLayer({
	path,
	comments,
	build,
	children,
}: {
	path: string;
	comments: HighLevelDiffComments;
	build: (quote: string, note: string) => DiffComment;
	children: ReactNode;
}) {
	const selection = usePreviewSelection();
	const { add } = selectionActions({
		path,
		pending: selection.pending,
		clear: selection.clear,
		onComment: comments.onComment,
		build: (pending, note) => build(pending.quote, note),
	});

	return (
		<SelectionCommentLayer
			selection={selection}
			path={path}
			cwd={comments.cwd}
			unavailable={comments.unavailable}
			onAdd={add}
			onAddRule={undefined}
		>
			{children}
		</SelectionCommentLayer>
	);
}
