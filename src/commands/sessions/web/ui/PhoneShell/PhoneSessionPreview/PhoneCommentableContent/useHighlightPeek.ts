import { type MouseEvent, useState } from "react";
import type { PendingComment } from "../../../App/PendingComment";
import type { LocalComment } from "../../../App/SessionContent/PrPreviewSlideInPane/PrPreviewPane/usePrComments";
import { commentAtTap } from "../commentAtTap";
import type { usePhoneReviewPane } from "../usePhoneReviewPane";

export function useHighlightPeek(
	review: ReturnType<typeof usePhoneReviewPane>,
) {
	const { pane } = review;
	const [comment, setComment] = useState<LocalComment | null>(null);
	return {
		onTap: (event: MouseEvent) =>
			setComment(
				commentAtTap(pane.contentRef.current, event.target, pane.comments),
			),
		selectOrOpen: (pending: PendingComment) => {
			const existing = pane.comments.find(
				(c) => c.start < pending.end && pending.start < c.end,
			);
			if (existing) setComment(existing);
			else pane.onSelect(pending);
		},
		peek: {
			comment,
			onClose: () => setComment(null),
			onDelete: (c: LocalComment) => {
				pane.remove(c.id);
				setComment(null);
			},
			onEdit: (c: LocalComment) => {
				setComment(null);
				review.edit(c);
			},
		},
	};
}
