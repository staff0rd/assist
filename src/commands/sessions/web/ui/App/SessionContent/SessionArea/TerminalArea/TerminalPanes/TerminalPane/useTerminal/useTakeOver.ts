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
	const takeOver = useCallback(() => {
		staleRef.current = false;
		const h = handleRef.current;
		if (!h) return;
		h.term.reset();
		if (!hasTerminalSize(containerRef.current)) return;
		h.fitAddon.fit();
		h.term.focus();
		sendResize(sessionId, h.term.cols, h.term.rows, true);
	}, [containerRef, handleRef, staleRef, sessionId, sendResize]);

	useEffect(() => {
		if (ownership === "other") staleRef.current = true;
		else if (ownership === "mine" && staleRef.current) takeOver();
	}, [staleRef, ownership, takeOver]);

	return takeOver;
}
