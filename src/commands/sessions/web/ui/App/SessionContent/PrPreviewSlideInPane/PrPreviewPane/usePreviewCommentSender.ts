import { useState } from "react";
import { pasteAndSubmit } from "../../../../../../shared/pasteAndSubmit";
import { commentTarget } from "../../../commentTarget";
import { formatBlockquoteComment } from "../../../formatBlockquoteComment";
import type { SessionInfo } from "../../../../types";

export function usePreviewCommentSender(
	session: SessionInfo | undefined,
	sendInput: ((sessionId: string, data: string) => void) | undefined,
	quote: string | undefined,
	onSent: () => void,
) {
	const [sentTo, setSentTo] = useState<string | null>(null);
	const target = commentTarget(sendInput ? session : undefined);
	const live = target.session;

	return {
		onSend: (note: string) => {
			if (!live || !sendInput || quote === undefined) return;
			pasteAndSubmit(sendInput, live.id, formatBlockquoteComment(quote, note));
			setSentTo(live.name);
			onSent();
		},
		unavailable: target.unavailable,
		sentTo,
		clearSent: () => setSentTo(null),
	};
}
