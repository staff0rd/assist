import { type RefObject, useCallback, useEffect } from "react";
import type { Ownership } from "../../Ownership";
import type { ResizeFn } from "../../../ResizeFn";
import { isSessionCardFocusHeld } from "../../../../../../holdSessionCardFocus";
import { isUserPresent } from "./isUserPresent";
import type { TerminalHandle } from "./createTerminal";
import { hasTerminalSize } from "./hasTerminalSize";

type FitDeps = {
	containerRef: RefObject<HTMLDivElement | null>;
	handleRef: RefObject<TerminalHandle | null>;
	staleRef: RefObject<boolean>;
	mayResize: () => boolean;
	takeOver: () => void;
};

export function useFitWhenVisible(
	{ containerRef, handleRef, staleRef, mayResize, takeOver }: FitDeps,
	sessionId: string,
	{ visible, ownership }: { visible: boolean; ownership: Ownership },
	sendResize: ResizeFn,
): void {
	const fit = useCallback(() => {
		const h = handleRef.current;
		if (!h || !mayResize() || !hasTerminalSize(containerRef.current)) return;
		h.fitAddon.fit();
		if (!isSessionCardFocusHeld()) h.term.focus();
		sendResize(sessionId, h.term.cols, h.term.rows);
	}, [containerRef, handleRef, mayResize, sessionId, sendResize]);

	useEffect(() => {
		if (!visible) return;
		const id = setTimeout(() => {
			if (staleRef.current && isUserPresent()) takeOver();
			else fit();
		}, 50);
		return () => clearTimeout(id);
	}, [visible, staleRef, takeOver, fit]);

	useEffect(() => {
		if (!visible) return;
		fit();
		window.addEventListener("focus", fit);
		return () => window.removeEventListener("focus", fit);
	}, [visible, ownership, fit]);
}
