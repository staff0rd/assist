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
import { usePersistHighLevelProgress } from "./useHighLevelReviewPane/usePersistHighLevelProgress";

export function useHighLevelReviewPane(
	preview: PrPreview,
	session: SessionInfo | undefined,
	sendInput: ((sessionId: string, data: string) => void) | undefined,
) {
	const { payload, sliced, progress, head } = useHighLevelPanePayload(preview);
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
	usePersistHighLevelProgress(
		preview.requestId,
		head,
		checklist.items,
		queue.queued,
	);
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
		head,
	};
}
