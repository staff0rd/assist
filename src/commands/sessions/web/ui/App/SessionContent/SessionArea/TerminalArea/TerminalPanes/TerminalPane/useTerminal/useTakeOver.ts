import { type RefObject, useCallback, useEffect } from "react";
import type { ResizeFn } from "../../../ResizeFn";
import type { Ownership } from "../../Ownership";
import { hasTerminalSize } from "./hasTerminalSize";
import type { SessionTerminal } from "./setupTerminal";

type TakeOverRefs = {
	containerRef: RefObject<HTMLDivElement | null>;
	handleRef: RefObject<SessionTerminal | null>;
	staleRef: RefObject<boolean>;
};

export function useTakeOver(
	{ containerRef, handleRef, staleRef }: TakeOverRefs,
	sessionId: string,
	{ ownership, ended }: { ownership: Ownership; ended: boolean },
	sendResize: ResizeFn,
): () => void {
	const takeOver = useCallback(() => {
		staleRef.current = false;
		const h = handleRef.current;
		if (!h) return;
		h.term.reset();
		if (ended) h.replayOutput();
		if (!hasTerminalSize(containerRef.current)) return;
		h.fitAddon.fit();
		h.term.focus();
		sendResize(sessionId, h.term.cols, h.term.rows, true);
	}, [containerRef, handleRef, staleRef, sessionId, ended, sendResize]);

	useEffect(() => {
		if (ownership === "other") staleRef.current = true;
		else if (ownership === "mine" && staleRef.current) takeOver();
	}, [staleRef, ownership, takeOver]);

	return takeOver;
}
