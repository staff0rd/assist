import type { Terminal } from "@xterm/xterm";
import { type RefObject, useEffect, useRef } from "react";
import { createVerticalDrag } from "./createVerticalDrag";
import { listenTouch } from "./listenTouch";
import {
	type LineAccumulator,
	scrollPhoneTerminal,
} from "./scrollPhoneTerminal";

export function useTouchScrollback(
	scrollRef: RefObject<HTMLElement | null>,
	termRef: RefObject<Terminal | null>,
	onScrolled: () => void,
): void {
	const onScrolledRef = useRef(onScrolled);
	onScrolledRef.current = onScrolled;

	useEffect(() => {
		const el = scrollRef.current;
		if (!el) return;
		const acc: LineAccumulator = { px: 0 };
		const drag = createVerticalDrag((dy) => {
			const term = termRef.current;
			if (!term) return;
			scrollPhoneTerminal(el, term, dy, acc);
			onScrolledRef.current();
		});
		const unlisten = listenTouch(el, drag);
		return () => {
			drag.stop();
			unlisten();
		};
	}, [scrollRef, termRef]);
}
