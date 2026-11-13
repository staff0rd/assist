import { useState } from "react";
import type { PreviewReviewComment } from "../../../../../../../shared/PreviewDecision";
import type { HighLevelPaneProgress } from "./loadPersistedHighLevelProgress";

export function useHighLevelReviewQueue(saved?: HighLevelPaneProgress) {
	const [queued, setQueued] = useState<PreviewReviewComment[]>(
		() => saved?.reviewComments ?? [],
	);
	return {
		queued,
		onQueue: (comment: PreviewReviewComment) =>
			setQueued((current) => [...current, comment]),
		onRemove: (index: number) =>
			setQueued((current) => current.filter((_, i) => i !== index)),
		onEdit: (index: number, note: string) =>
			setQueued((current) =>
				current.map((comment, i) =>
					i === index ? { ...comment, note } : comment,
				),
			),
	};
}
