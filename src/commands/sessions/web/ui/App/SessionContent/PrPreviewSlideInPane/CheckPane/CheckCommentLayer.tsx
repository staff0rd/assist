import type { ReactNode } from "react";
import type { AskCheckInput } from "../../../../../../shared/askCheckInputSchema";
import { SelectionCommentLayer } from "../../../SelectionCommentLayer";
import { selectionActions } from "../../../selectionActions";
import { usePreviewSelection } from "../../../usePreviewSelection";
import type { HighLevelDiffComments } from "../HighLevelDiffComments";
import { checkCommentFrom } from "./CheckCommentLayer/checkCommentFrom";

const PATH = "Manual check";

export function CheckCommentLayer({
	check,
	comments,
	children,
}: {
	check: AskCheckInput;
	comments: HighLevelDiffComments;
	children: ReactNode;
}) {
	const selection = usePreviewSelection();
	const { add } = selectionActions({
		path: PATH,
		pending: selection.pending,
		clear: selection.clear,
		onComment: comments.onComment,
		build: (pending, note) => checkCommentFrom(check, pending.quote, note),
	});

	return (
		<SelectionCommentLayer
			selection={selection}
			path={PATH}
			cwd={comments.cwd}
			unavailable={comments.unavailable}
			onAdd={add}
			onAddRule={undefined}
		>
			{children}
		</SelectionCommentLayer>
	);
}
