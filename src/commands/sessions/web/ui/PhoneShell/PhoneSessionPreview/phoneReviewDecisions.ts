import type { PreviewStartTarget } from "../../../../shared/PreviewDecision";
import type { PrPreview } from "../../../../shared/SessionInfoBase";
import type { usePrPane } from "../../App/SessionContent/PrPreviewSlideInPane/PrPreviewPane/usePrPane";

export function phoneReviewDecisions(
	preview: PrPreview,
	cwd: string | undefined,
	pane: ReturnType<typeof usePrPane>,
	sending: boolean,
) {
	const sent = () =>
		pane.comments.map((c) => ({ quote: c.quote, note: c.note }));
	return {
		canStart: preview.kind === "backlog-item" && preview.canStart === true,
		startOrigin: preview.startOrigin,
		cwd,
		sending,
		onReject: () => pane.onDecide("reject", sent()),
		onApprove: () => pane.onDecide("approve", sent()),
		onApproveAndStart: (startOn?: PreviewStartTarget) =>
			pane.onDecide("approve", sent(), startOn ?? true),
	};
}
