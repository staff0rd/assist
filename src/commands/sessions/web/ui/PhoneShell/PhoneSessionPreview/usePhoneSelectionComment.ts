import {
	type RefObject,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import { snapRangeToWords } from "../../App/finishSelection/snapRangeToWords";
import type { PendingComment } from "../../App/PendingComment";
import { pendingFromRange } from "../../App/pendingFromRange";
import { nativeCommentMenu } from "./nativeCommentMenu";

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
	const rangeRef = useRef<Range | null>(null);
	const onSelectRef = useRef(onSelect);
	useEffect(() => {
		onSelectRef.current = onSelect;
	});
	const [selected, setSelected] = useState(false);

	const track = useCallback((range: Range | null) => {
		rangeRef.current = range;
		setSelected(range !== null);
		nativeCommentMenu.setCommentable(range !== null);
	}, []);

	const comment = useCallback(() => {
		const content = contentRef.current;
		const range = rangeRef.current;
		if (!range || !content) return;
		const pending = pendingFromRange(content, snapRangeToWords(range));
		document.getSelection()?.removeAllRanges();
		track(null);
		if (pending) onSelectRef.current(pending);
	}, [contentRef, track]);

	useEffect(() => {
		const onChange = () => track(selectionWithin(contentRef.current));
		document.addEventListener("selectionchange", onChange);
		globalThis.addEventListener(nativeCommentMenu.event, comment);
		return () => {
			document.removeEventListener("selectionchange", onChange);
			globalThis.removeEventListener(nativeCommentMenu.event, comment);
			nativeCommentMenu.setCommentable(false);
		};
	}, [contentRef, comment, track]);

	return { showBar: selected && !nativeCommentMenu.available(), comment };
}
