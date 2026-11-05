import type { PrDecisionDetails } from "../../../../PrDecisionDetails";
import { HighLevelReviewActions } from "./HighLevelReviewActions";
import { HighLevelReviewQueue } from "./HighLevelReviewQueue";
import { highLevelReviewHandlers } from "./highLevelReviewHandlers";
import type { useHighLevelReviewPane } from "./useHighLevelReviewPane";

type Pane = ReturnType<typeof useHighLevelReviewPane>;

export function HighLevelReviewFooter({
	pane: { payload, checklist, queue, sliced, nav },
	onDecision,
}: {
	pane: Pane;
	onDecision: (
		decision: "approve" | "reject",
		details: PrDecisionDetails,
	) => void;
}) {
	return (
		<>
			<HighLevelReviewQueue queued={queue.queued} onRemove={queue.onRemove} />
			<HighLevelReviewActions
				failed={
					payload.checks.filter((check) => check.status === "fail").length
				}
				outstanding={checklist.outstanding}
				next={
					sliced ? { onNext: nav.onNext, disabled: !nav.hasNext } : undefined
				}
				{...highLevelReviewHandlers(
					checklist.checklist,
					queue.queued,
					onDecision,
				)}
			/>
		</>
	);
}
