import { useEffect, useRef } from "react";
import type {
	PreviewChecklistItem,
	PreviewReviewComment,
} from "../../../../../../../shared/PreviewDecision";
import type { HighLevelPaneProgress } from "../../../../../../../../review/highLevel/progressStore/StoredHighLevelProgress";

export function useWriteHighLevelProgress(
	items: PreviewChecklistItem[],
	reviewComments: PreviewReviewComment[],
	onChange: (progress: HighLevelPaneProgress) => void,
): void {
	const mounted = useRef(false);
	const latest = useRef(onChange);
	latest.current = onChange;
	useEffect(() => {
		if (!mounted.current) {
			mounted.current = true;
			return;
		}
		latest.current({ items, reviewComments });
	}, [items, reviewComments]);
}
