import { useMemo } from "react";
import type { PrPreviewComment } from "../../shared/SessionInfoBase";
import { clearPersistedComments } from "./PersistedComment";
import { previewHighlights } from "./previewHighlights";
import { usePrComments } from "./usePrComments";
import { usePreviewSelection } from "./usePreviewSelection";

type OnDecision = (
	decision: "approve" | "reject",
	comments: PrPreviewComment[],
) => void;

export function usePrPane(requestId: string, onDecision: OnDecision) {
	const { wrapperRef, contentRef, pending, dragRects, onMouseDown, clear } =
		usePreviewSelection();
	const { comments, add, remove } = usePrComments(requestId);

	const { commentColors, dragColor, ranges } = useMemo(
		() => previewHighlights(comments, pending),
		[comments, pending],
	);

	const onDecide: OnDecision = (decision, cmts) => {
		clearPersistedComments(requestId);
		onDecision(decision, cmts);
	};

	const onAdd = (note: string) => {
		if (pending)
			add({
				quote: pending.quote,
				note,
				start: pending.start,
				end: pending.end,
			});
		clear();
	};

	return {
		wrapperRef,
		contentRef,
		onMouseDown,
		comments,
		commentColors,
		remove,
		pending,
		ranges,
		dragRects,
		dragColor,
		onAdd,
		onCancel: clear,
		onDecide,
	};
}
