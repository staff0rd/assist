import { type RefObject, useCallback, useEffect, useRef } from "react";
import type { ResizeMode } from "../../ResizeFn";
import { phoneGridSize } from "./phoneGridSize";

type SendSize = (cols: number, rows: number, mode?: ResizeMode) => void;

export function usePhoneTakeOver(
	scrollRef: RefObject<HTMLElement | null>,
	charWidthRatio: number,
	sendSize: SendSize,
): () => void {
	const sendRef = useRef(sendSize);
	sendRef.current = sendSize;

	const send = useCallback(
		(mode?: ResizeMode) => {
			const el = scrollRef.current;
			if (!el || el.clientWidth === 0 || el.clientHeight === 0) return;
			const { cols, rows } = phoneGridSize(
				el.clientWidth,
				el.clientHeight,
				charWidthRatio,
			);
			sendRef.current(cols, rows, mode);
		},
		[scrollRef, charWidthRatio],
	);

	useEffect(() => {
		const el = scrollRef.current;
		if (!el) return;
		send("claim");
		const observer = new ResizeObserver(() => send());
		observer.observe(el);
		return () => observer.disconnect();
	}, [scrollRef, send]);

	return useCallback(() => send("claim"), [send]);
}
