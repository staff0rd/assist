import { previewRuleActions } from "../../App/SessionContent/PrPreviewSlideInPane/PrPreviewPane/previewRuleActions";
import type { usePrPane } from "../../App/SessionContent/PrPreviewSlideInPane/PrPreviewPane/usePrPane";
import { usePreviewCommentSender } from "../../App/SessionContent/PrPreviewSlideInPane/PrPreviewPane/usePreviewCommentSender";
import type { PhonePreviewProps } from "./PhonePreviewProps";

export function usePhoneCommentComposer(
	pane: ReturnType<typeof usePrPane>,
	editable: boolean,
	{ session, sendInput }: Pick<PhonePreviewProps, "session" | "sendInput">,
) {
	const quote = pane.pending?.quote;
	const sender = usePreviewCommentSender(
		session,
		sendInput,
		quote,
		pane.onCancel,
	);
	return {
		sender,
		composer: {
			quote,
			editable,
			cwd: session.cwd,
			unavailable: sender.unavailable,
			onAdd: sender.onSend,
			onQueue: pane.onAdd,
			...previewRuleActions(session.id, sendInput, quote, pane.onCancel),
			onCancel: pane.onCancel,
			onCollapse: pane.onCollapse,
		},
	};
}
