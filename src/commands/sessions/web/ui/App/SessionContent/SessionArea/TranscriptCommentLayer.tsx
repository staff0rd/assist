import type { ReactNode } from "react";
import { pasteAndSubmit } from "../../../../../shared/pasteAndSubmit";
import type { SessionInfo } from "../../../types";
import { formatQuotedComment } from "../../formatQuotedComment";
import { SelectionCommentLayer } from "../../SelectionCommentLayer";
import { selectionActions } from "../../selectionActions";
import { usePreviewSelection } from "../../usePreviewSelection";

const PATH = "Transcript";

export function TranscriptCommentLayer({
	session,
	sendInput,
	children,
}: {
	session: SessionInfo;
	sendInput: (sessionId: string, data: string) => void;
	children: ReactNode;
}) {
	const selection = usePreviewSelection();
	const { add } = selectionActions({
		path: PATH,
		pending: selection.pending,
		clear: selection.clear,
		onComment: (text: string) => pasteAndSubmit(sendInput, session.id, text),
		build: (pending, note) => formatQuotedComment(pending.quote, note),
	});
	return (
		<SelectionCommentLayer
			selection={selection}
			path={PATH}
			cwd={session.cwd}
			onAdd={add}
			onAddRule={undefined}
		>
			{children}
		</SelectionCommentLayer>
	);
}
