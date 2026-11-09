import { useEffect } from "react";
import type {
	PreviewChecklistItem,
	PreviewReviewComment,
} from "../../../../../../../shared/PreviewDecision";
import { savePersistedHighLevelProgress } from "./loadPersistedHighLevelProgress";

export function usePersistHighLevelProgress(
	requestId: string,
	head: string | undefined,
	items: PreviewChecklistItem[],
	reviewComments: PreviewReviewComment[],
): void {
	useEffect(() => {
		savePersistedHighLevelProgress(requestId, head, { items, reviewComments });
	}, [requestId, head, items, reviewComments]);
}
