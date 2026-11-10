import { useState } from "react";
import { previewPaneOptions } from "../../App/SessionContent/PrPreviewSlideInPane/PrPreviewPane/previewPaneOptions";
import { usePrPane } from "../../App/SessionContent/PrPreviewSlideInPane/PrPreviewPane/usePrPane";
import { phoneReviewDecisions } from "./phoneReviewDecisions";
import type { PhonePreviewProps } from "./PhonePreviewProps";
import { usePhoneCommentComposer } from "./usePhoneCommentComposer";

export function usePhoneReviewPane({
	preview,
	session,
	sendInput,
	onDecision,
}: Pick<
	PhonePreviewProps,
	"preview" | "session" | "sendInput" | "onDecision"
>) {
	const [reason, setReason] = useState("");
	const [sending, setSending] = useState(false);
	const options = previewPaneOptions(
		preview,
		session.id,
		session.cwd,
		(decision, details) => {
			setSending(true);
			const trimmed = reason.trim();
			onDecision(
				decision,
				decision === "reject" && trimmed !== ""
					? { ...details, reason: trimmed }
					: details,
			);
		},
	);
	const pane = usePrPane(options);
	const comments = usePhoneCommentComposer(pane, {
		session,
		sendInput,
	});
	return {
		options,
		pane,
		reason,
		setReason,
		...comments,
		decisions: phoneReviewDecisions(preview, session.cwd, pane, sending),
	};
}
