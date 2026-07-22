import { useRef, useState } from "react";
import type { PendingComment } from "./PrCommentPopover";
import { rangeToOffsets } from "./rangeToOffsets";
import { snapRangeToWords } from "./snapRangeToWords";

export function usePreviewSelection() {
	const contentRef = useRef<HTMLDivElement>(null);
	const [pending, setPending] = useState<PendingComment | null>(null);

	const capture = () => {
		const root = contentRef.current;
		const sel = globalThis.getSelection();
		if (!root || !sel || sel.isCollapsed || sel.rangeCount === 0) return;
		const raw = sel.getRangeAt(0);
		if (!root.contains(raw.commonAncestorContainer)) return;

		const range = snapRangeToWords(raw);
		const quote = range.toString().trim();
		if (!quote) return;

		const rect = range.getBoundingClientRect();
		const { start, end } = rangeToOffsets(root, range);
		sel.removeAllRanges();
		setPending({ quote, top: rect.bottom, left: rect.left, start, end });
	};

	const clear = () => {
		setPending(null);
		globalThis.getSelection()?.removeAllRanges();
	};

	return { contentRef, pending, capture, clear };
}
