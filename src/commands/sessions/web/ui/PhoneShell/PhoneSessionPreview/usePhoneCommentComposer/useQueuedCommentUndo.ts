import { useState } from "react";
import type { usePrPane } from "../../../App/SessionContent/PrPreviewSlideInPane/PrPreviewPane/usePrPane";

export function useQueuedCommentUndo(
	pane: Pick<ReturnType<typeof usePrPane>, "comments" | "remove">,
) {
	const [open, setOpen] = useState(false);
	return {
		open,
		offer: () => setOpen(true),
		onClose: () => setOpen(false),
		onUndo: () => {
			const last = pane.comments.at(-1);
			if (last) pane.remove(last.id);
			setOpen(false);
		},
	};
}
