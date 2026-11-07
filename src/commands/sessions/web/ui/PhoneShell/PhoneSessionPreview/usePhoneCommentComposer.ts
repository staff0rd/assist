import { useState } from "react";
import { previewRuleActions } from "../../App/SessionContent/PrPreviewSlideInPane/PrPreviewPane/previewRuleActions";
import type { LocalComment } from "../../App/SessionContent/PrPreviewSlideInPane/PrPreviewPane/usePrComments";
import type { usePrPane } from "../../App/SessionContent/PrPreviewSlideInPane/PrPreviewPane/usePrPane";
import { usePreviewCommentSender } from "../../App/SessionContent/PrPreviewSlideInPane/PrPreviewPane/usePreviewCommentSender";
import type { PhoneCommentComposerProps } from "./PhoneCommentComposer/PhoneCommentComposerProps";
import type { PhonePreviewProps } from "./PhonePreviewProps";
import { useQueuedCommentUndo } from "./usePhoneCommentComposer/useQueuedCommentUndo";

export function usePhoneCommentComposer(
	pane: ReturnType<typeof usePrPane>,
	{ session, sendInput }: Pick<PhonePreviewProps, "session" | "sendInput">,
) {
	const quote = pane.pending?.quote;
	const [editing, setEditing] = useState<LocalComment | null>(null);
	const undo = useQueuedCommentUndo(pane);
	const cancel = () => {
		setEditing(null);
		pane.onCancel();
	};
	const sender = usePreviewCommentSender(session, sendInput, quote, cancel);
	const composer: PhoneCommentComposerProps = {
		quote,
		initialNote: editing?.note ?? "",
		editing: editing !== null,
		cwd: session.cwd,
		unavailable: sender.unavailable,
		onAdd: sender.onSend,
		onQueue: (note) => {
			if (editing) pane.remove(editing.id);
			else undo.offer();
			setEditing(null);
			pane.onAdd(note);
		},
		...previewRuleActions(session.id, sendInput, quote, cancel),
		onCancel: cancel,
	};

	return {
		sender,
		undo,
		composer,
		edit: (comment: LocalComment) => {
			setEditing(comment);
			pane.onSelect({ ...comment, top: 0, left: 0 });
		},
	};
}
