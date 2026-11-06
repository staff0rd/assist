import { useMemo } from "react";
import { usePreviewSelection } from "../../../../usePreviewSelection";
import { usePrComments } from "../usePrComments";
import { previewHighlights } from "./previewHighlights";
import { usePaneSelectionActions } from "./usePaneSelectionActions";

export function usePaneComments(
	requestId: string,
	supersedes: string | undefined,
	collapse: (quote: string) => void,
) {
	const {
		wrapperRef,
		contentRef,
		pending,
		dragRects,
		onMouseDown,
		clear,
		select,
	} = usePreviewSelection();
	const { comments, add, remove } = usePrComments(
		requestId,
		supersedes,
		contentRef,
	);
	const { commentColors, dragColor, ranges } = useMemo(
		() => previewHighlights(comments, pending),
		[comments, pending],
	);
	const { onAdd, onCollapse } = usePaneSelectionActions(
		pending,
		add,
		collapse,
		clear,
	);

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
		onCollapse,
		onCancel: clear,
		onSelect: select,
	};
}
