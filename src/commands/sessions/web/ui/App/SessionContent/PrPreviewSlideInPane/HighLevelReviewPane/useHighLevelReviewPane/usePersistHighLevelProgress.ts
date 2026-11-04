import { useEffect } from "react";
import type {
	PreviewChecklistItem,
	PreviewReviewComment,
} from "../../../../../../../shared/PreviewDecision";
import { savePersistedHighLevelProgress } from "./loadPersistedHighLevelProgress";

export function usePersistHighLevelProgress(
	requestId: string,
	items: PreviewChecklistItem[],
	reviewComments: PreviewReviewComment[],
): void {
	useEffect(() => {
		savePersistedHighLevelProgress(requestId, { items, reviewComments });
	}, [requestId, items, reviewComments]);
}
