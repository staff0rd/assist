import { type RefObject, useEffect } from "react";
import type { ResizeFn } from "../../../ResizeFn";
import { isSessionCardFocusHeld } from "../../../../../../holdSessionCardFocus";
import type { TerminalHandle } from "./createTerminal";
import { hasTerminalSize } from "./hasTerminalSize";

type FitRefs = {
	containerRef: RefObject<HTMLDivElement | null>;
	handleRef: RefObject<TerminalHandle | null>;
	staleRef: RefObject<boolean>;
};

export function useFitWhenVisible(
	{ containerRef, handleRef, staleRef }: FitRefs,
	sessionId: string,
	visible: boolean,
	sendResize: ResizeFn,
): void {
	useEffect(() => {
		const h = handleRef.current;
		if (!visible || !h) return;
		const id = setTimeout(() => {
			if (staleRef.current || !hasTerminalSize(containerRef.current)) return;
			h.fitAddon.fit();
			if (!isSessionCardFocusHeld()) h.term.focus();
			sendResize(sessionId, h.term.cols, h.term.rows);
		}, 50);
		return () => clearTimeout(id);
	}, [containerRef, handleRef, staleRef, visible, sessionId, sendResize]);
}
