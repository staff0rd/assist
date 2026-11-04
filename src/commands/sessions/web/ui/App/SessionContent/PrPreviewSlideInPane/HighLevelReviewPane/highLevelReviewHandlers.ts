import type {
	PreviewChecklistItem,
	PreviewReviewComment,
	PreviewReviewEvent,
} from "../../../../../../shared/PreviewDecision";
import type { PrDecisionDetails } from "../../../../PrDecisionDetails";
import { highLevelDecisionDetails } from "./highLevelReviewHandlers/highLevelDecisionDetails";

export function highLevelReviewHandlers(
	checklist: () => PreviewChecklistItem[],
	queued: PreviewReviewComment[],
	onDecision: (
		decision: "approve" | "reject",
		details: PrDecisionDetails,
	) => void,
) {
	const details = () => highLevelDecisionDetails(checklist(), queued);
	const submit = (
		decision: "approve" | "reject",
		reviewEvent: PreviewReviewEvent,
	) => onDecision(decision, { ...details(), reviewEvent });
	return {
		onApprove: () => submit("approve", "APPROVE"),
		onComment: () => submit("approve", "COMMENT"),
		onRequestChanges: () => submit("reject", "REQUEST_CHANGES"),
		onClose: () => onDecision("reject", { ...details(), dismissed: true }),
		onRestart: () =>
			onDecision("reject", { ...details(), dismissed: true, restart: true }),
	};
}
