import { useMemo } from "react";
import type { PrPreview } from "../../../../../../shared/SessionInfoBase";
import type { SessionInfo } from "../../../../types";
import { useHighLevelReviewNav } from "../HighLevelSliceReview/useHighLevelReviewNav";
import { highLevelCheckDetails } from "./useHighLevelReviewPane/highLevelCheckDetails";
import { highLevelJumpCounts } from "./useHighLevelReviewPane/highLevelJumpCounts";
import { useHighLevelChecklist } from "./useHighLevelChecklist";
import { useHighLevelDiffComments } from "./useHighLevelReviewPane/useHighLevelDiffComments";
import { useHighLevelPanePayload } from "./useHighLevelReviewPane/useHighLevelPanePayload";
import { useHighLevelReviewQueue } from "./useHighLevelReviewPane/useHighLevelReviewQueue";
import type { HighLevelStoredProgress } from "./highLevelStoredProgress/useHighLevelStoredProgress";
import { useWriteHighLevelProgress } from "./useHighLevelReviewPane/useWriteHighLevelProgress";

export function useHighLevelReviewPane(
	preview: PrPreview,
	session: SessionInfo | undefined,
	sendInput: ((sessionId: string, data: string) => void) | undefined,
	stored: Pick<HighLevelStoredProgress, "progress" | "onChange">,
) {
	const { payload, sliced } = useHighLevelPanePayload(preview);
	const { progress } = stored;
	const checklist = useHighLevelChecklist(
		payload.checks,
		progress,
		sliced?.slicing,
	);
	const queue = useHighLevelReviewQueue(progress);
	const nav = useHighLevelReviewNav(sliced?.entries ?? []);
	const { comments, sentTo, clearSent } = useHighLevelDiffComments(
		session,
		sendInput,
	);
	const diffComments = { ...comments, onQueue: queue.onQueue };
	useWriteHighLevelProgress(checklist.items, queue.queued, stored.onChange);
	const counts = useMemo(() => highLevelJumpCounts(payload), [payload]);

	return {
		payload,
		checklist,
		queue,
		details: highLevelCheckDetails(payload, diffComments),
		counts,
		sentTo,
		clearSent,
		sliced,
		nav,
		diffComments,
	};
}
