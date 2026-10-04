import { type RefObject, useEffect } from "react";
import type { Ownership } from "../../Ownership";
import type { ResizeFn } from "../../../ResizeFn";
import { isSessionCardFocusHeld } from "../../../../../../holdSessionCardFocus";
import type { TerminalHandle } from "./createTerminal";
import { hasTerminalSize } from "./hasTerminalSize";

type FitRefs = {
	containerRef: RefObject<HTMLDivElement | null>;
	handleRef: RefObject<TerminalHandle | null>;
	mayResize: () => boolean;
};

export function useFitWhenVisible(
	{ containerRef, handleRef, mayResize }: FitRefs,
	sessionId: string,
	{ visible, ownership }: { visible: boolean; ownership: Ownership },
	sendResize: ResizeFn,
): void {
	useEffect(() => {
		if (!visible) return;
		const fit = () => {
			const h = handleRef.current;
			if (!h || !mayResize() || !hasTerminalSize(containerRef.current)) return;
			h.fitAddon.fit();
			if (!isSessionCardFocusHeld()) h.term.focus();
			sendResize(sessionId, h.term.cols, h.term.rows);
		};
		const id = setTimeout(fit, 50);
		window.addEventListener("focus", fit);
		return () => {
			clearTimeout(id);
			window.removeEventListener("focus", fit);
		};
	}, [
		containerRef,
		handleRef,
		mayResize,
		visible,
		ownership,
		sessionId,
		sendResize,
	]);
}
