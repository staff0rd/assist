import { type RefObject, useEffect, useReducer, useState } from "react";
import { snapRangeToWords } from "../../App/finishSelection/snapRangeToWords";
import type { PendingComment } from "../../App/PendingComment";
import { pendingFromRange } from "../../App/pendingFromRange";

function selectionWithin(content: HTMLElement | null): Range | null {
	const selection = document.getSelection();
	if (!content || !selection || selection.rangeCount === 0) return null;
	const range = selection.getRangeAt(0);
	if (range.collapsed || !content.contains(range.commonAncestorContainer))
		return null;
	return range.cloneRange();
}

export function usePhoneSelectionComment(
	contentRef: RefObject<HTMLElement | null>,
	onSelect: (pending: PendingComment) => void,
) {
	const [range, setRange] = useState<Range | null>(null);
	const [, reposition] = useReducer((n: number) => n + 1, 0);

	useEffect(() => {
		const onChange = () => setRange(selectionWithin(contentRef.current));
		document.addEventListener("selectionchange", onChange);
		document.addEventListener("scroll", reposition, true);
		return () => {
			document.removeEventListener("selectionchange", onChange);
			document.removeEventListener("scroll", reposition, true);
		};
	}, [contentRef]);

	const comment = () => {
		const content = contentRef.current;
		if (!range || !content) return;
		const pending = pendingFromRange(content, snapRangeToWords(range));
		document.getSelection()?.removeAllRanges();
		setRange(null);
		if (pending) onSelect(pending);
	};

	return { rect: range?.getBoundingClientRect() ?? null, comment };
}
