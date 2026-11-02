import { useEffect, useMemo } from "react";
import type { PrPreview } from "../../../../../../shared/SessionInfoBase";
import type { SessionInfo } from "../../../../types";
import { highLevelCheckDetails } from "./useHighLevelReviewPane/highLevelCheckDetails";
import { highLevelJumpCounts } from "./useHighLevelReviewPane/highLevelJumpCounts";
import { parseHighLevelPreview } from "./useHighLevelReviewPane/parseHighLevelPreview";
import {
	loadPersistedHighLevelProgress,
	savePersistedHighLevelProgress,
} from "./useHighLevelReviewPane/loadPersistedHighLevelProgress";
import { useHighLevelChecklist } from "./useHighLevelChecklist";
import { useHighLevelDiffComments } from "./useHighLevelReviewPane/useHighLevelDiffComments";
import { useHighLevelReviewQueue } from "./useHighLevelReviewPane/useHighLevelReviewQueue";

export function useHighLevelReviewPane(
	preview: PrPreview,
	session: SessionInfo | undefined,
	sendInput: ((sessionId: string, data: string) => void) | undefined,
) {
	const payload = useMemo(
		() => parseHighLevelPreview(preview.body),
		[preview.body],
	);
	const progress = useMemo(
		() =>
			loadPersistedHighLevelProgress(preview.requestId, preview.supersedes) ??
			payload.draft ??
			payload.saved,
		[preview.requestId, preview.supersedes, payload],
	);
	const checklist = useHighLevelChecklist(payload.checks, progress);
	const queue = useHighLevelReviewQueue(progress);
	const { comments, sentTo, clearSent } = useHighLevelDiffComments(
		session,
		sendInput,
	);
	const details = highLevelCheckDetails(payload, {
		...comments,
		onQueue: queue.onQueue,
	});

	useEffect(() => {
		savePersistedHighLevelProgress(preview.requestId, {
			items: checklist.items,
			reviewComments: queue.queued,
		});
	}, [preview.requestId, checklist.items, queue.queued]);

	const counts = useMemo(() => highLevelJumpCounts(payload), [payload]);

	return { payload, checklist, queue, details, counts, sentTo, clearSent };
}
