import { type RefObject, useCallback, useEffect } from "react";
import type { ResizeFn } from "../../../ResizeFn";
import type { TerminalHandle } from "./createTerminal";
import { hasTerminalSize } from "./hasTerminalSize";

type TakeOverRefs = {
	containerRef: RefObject<HTMLDivElement | null>;
	handleRef: RefObject<TerminalHandle | null>;
	inactiveRef: RefObject<boolean>;
};

export function useTakeOver(
	{ containerRef, handleRef, inactiveRef }: TakeOverRefs,
	sessionId: string,
	inactive: boolean,
	sendResize: ResizeFn,
): () => void {
	const takeOver = useCallback(() => {
		inactiveRef.current = false;
		const h = handleRef.current;
		if (!h) return;
		h.term.reset();
		if (!hasTerminalSize(containerRef.current)) return;
		h.fitAddon.fit();
		h.term.focus();
		sendResize(sessionId, h.term.cols, h.term.rows, true);
	}, [containerRef, handleRef, inactiveRef, sessionId, sendResize]);

	useEffect(() => {
		const wasInactive = inactiveRef.current;
		inactiveRef.current = inactive;
		if (wasInactive && !inactive) takeOver();
	}, [inactiveRef, inactive, takeOver]);

	return takeOver;
}
