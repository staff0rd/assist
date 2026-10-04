import { type RefObject, useCallback, useEffect } from "react";
import type { ResizeFn } from "../../../ResizeFn";
import type { Ownership } from "../../Ownership";
import type { TerminalHandle } from "./createTerminal";
import { hasTerminalSize } from "./hasTerminalSize";

type TakeOverRefs = {
	containerRef: RefObject<HTMLDivElement | null>;
	handleRef: RefObject<TerminalHandle | null>;
	staleRef: RefObject<boolean>;
};

export function useTakeOver(
	{ containerRef, handleRef, staleRef }: TakeOverRefs,
	sessionId: string,
	ownership: Ownership,
	sendResize: ResizeFn,
): () => void {
	const fit = useCallback(() => {
		const h = handleRef.current;
		if (!h || !hasTerminalSize(containerRef.current)) return undefined;
		h.fitAddon.fit();
		return h;
	}, [containerRef, handleRef]);

	const takeOver = useCallback(() => {
		staleRef.current = false;
		handleRef.current?.term.reset();
		const h = fit();
		if (!h) return;
		h.term.focus();
		sendResize(sessionId, h.term.cols, h.term.rows, true);
	}, [fit, handleRef, staleRef, sessionId, sendResize]);

	useEffect(() => {
		if (ownership === "other") {
			staleRef.current = true;
			return;
		}
		if (!staleRef.current) return;
		if (ownership === "mine") return takeOver();
		const h = fit();
		if (h) sendResize(sessionId, h.term.cols, h.term.rows);
	}, [staleRef, ownership, takeOver, fit, sessionId, sendResize]);

	return takeOver;
}
