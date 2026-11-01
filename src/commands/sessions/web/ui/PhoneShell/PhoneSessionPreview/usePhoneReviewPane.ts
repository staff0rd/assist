import { useState } from "react";
import { previewPaneOptions } from "../../App/SessionContent/PrPreviewSlideInPane/PrPreviewPane/previewPaneOptions";
import { usePrPane } from "../../App/SessionContent/PrPreviewSlideInPane/PrPreviewPane/usePrPane";
import type { PhonePreviewProps } from "./PhonePreviewProps";

export function usePhoneReviewPane({
	preview,
	session,
	onDecision,
}: Pick<PhonePreviewProps, "preview" | "session" | "onDecision">) {
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
	const sent = () =>
		pane.comments.map((c) => ({ quote: c.quote, note: c.note }));

	return {
		options,
		pane,
		reason,
		setReason,
		decisions: {
			canStart: preview.kind === "backlog-item" && preview.canStart === true,
			sending,
			onReject: () => pane.onDecide("reject", []),
			onApprove: () => pane.onDecide("approve", sent()),
			onApproveAndStart: () => pane.onDecide("approve", sent(), true),
		},
	};
}
