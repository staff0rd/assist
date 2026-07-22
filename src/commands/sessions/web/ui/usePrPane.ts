import { useMemo } from "react";
import type { PrPreviewComment } from "../../shared/SessionInfoBase";
import { clearPersistedComments } from "./PersistedComment";
import { usePrComments } from "./usePrComments";
import { usePreviewSelection } from "./usePreviewSelection";

type OnDecision = (
	decision: "approve" | "reject",
	comments: PrPreviewComment[],
) => void;

export function usePrPane(requestId: string, onDecision: OnDecision) {
	const { contentRef, pending, capture, clear } = usePreviewSelection();
	const { comments, add, remove } = usePrComments(requestId);

	const ranges = useMemo(() => {
		const committed = comments.map((c) => ({ start: c.start, end: c.end }));
		if (!pending) return committed;
		return [...committed, { start: pending.start, end: pending.end }];
	}, [comments, pending]);

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
		contentRef,
		capture,
		comments,
		remove,
		pending,
		ranges,
		onAdd,
		onCancel: clear,
		onDecide,
	};
}
