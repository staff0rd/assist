import { useMemo } from "react";
import { criteriaPaneActions } from "./criteriaPaneActions";
import type { PrPaneOptions } from "./PrPaneOptions";
import { previewHighlights } from "./previewHighlights";
import { usePaneScreenshots } from "./usePaneScreenshots";
import { usePrComments } from "./usePrComments";
import { usePrDecision } from "./usePrDecision";
import { useEditableBody } from "./useEditableBody";
import { usePaneSelectionActions } from "./usePaneSelectionActions";
import { usePreviewSelection } from "./usePreviewSelection";

export function usePrPane(options: PrPaneOptions) {
	const { requestId, sessionId, cwd, onDecision, isPr, resolvedDraft } =
		options;
	const edit = useEditableBody(options.initialBody, options.editable);
	const { wrapperRef, contentRef, pending, dragRects, onMouseDown, clear } =
		usePreviewSelection();
	const { comments, add, remove } = usePrComments(requestId);
	const shots = usePaneScreenshots(cwd, options.screenshots);
	const decision = usePrDecision(
		requestId,
		sessionId,
		onDecision,
		isPr,
		resolvedDraft,
		() => shots.screenshots.map((s) => s.markdown),
		edit.editedBody,
	);

	const { commentColors, dragColor, ranges } = useMemo(
		() => previewHighlights(comments, pending),
		[comments, pending],
	);

	const { onAdd, onCollapse } = usePaneSelectionActions(
		pending,
		add,
		edit.collapse,
		clear,
	);

	return {
		body: edit.body,
		...criteriaPaneActions(edit),
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
		onCollapse,
		onCancel: clear,
		onDecide: decision.onDecide,
		chain: decision.chain,
		setChain: decision.setChain,
		...shots,
	};
}
