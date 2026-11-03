import type { ReactNode } from "react";
import type { HighLevelManualTesting } from "../../../../../../../review/highLevel/types";
import { SelectionCommentLayer } from "../../../SelectionCommentLayer";
import { selectionActions } from "../../../selectionActions";
import { usePreviewSelection } from "../../../usePreviewSelection";
import type { HighLevelDiffComments } from "../HighLevelDiffComments";
import { manualTestingCommentFrom } from "./manualTestingCommentFrom";

const PATH = "Manual testing";

export function ManualTestingCommentLayer({
	manualTesting,
	comments,
	children,
}: {
	manualTesting: HighLevelManualTesting;
	comments?: HighLevelDiffComments | undefined;
	children: ReactNode;
}) {
	const selection = usePreviewSelection();
	if (!comments?.onComment && !comments?.onQueue && !comments?.unavailable)
		return <>{children}</>;
	const { add, queue } = selectionActions({
		path: PATH,
		pending: selection.pending,
		clear: selection.clear,
		onComment: comments.onComment,
		onQueue: comments.onQueue,
		build: (pending, note) =>
			manualTestingCommentFrom(manualTesting, pending.quote, note),
	});

	return (
		<SelectionCommentLayer
			selection={selection}
			path={PATH}
			cwd={comments.cwd}
			unavailable={comments.unavailable}
			onAdd={add}
			onQueue={queue}
			onAddRule={undefined}
		>
			{children}
		</SelectionCommentLayer>
	);
}
