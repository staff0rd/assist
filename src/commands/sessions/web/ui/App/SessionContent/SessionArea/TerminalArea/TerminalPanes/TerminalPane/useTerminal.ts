import { type RefObject, useEffect, useRef } from "react";
import type { ResizeFn } from "../../ResizeFn";
import type { TerminalHandle } from "./useTerminal/createTerminal";
import { isSessionCardFocusHeld } from "../../../../../holdSessionCardFocus";
import { hasTerminalSize } from "./useTerminal/hasTerminalSize";
import { setupTerminal } from "./useTerminal/setupTerminal";
import { useTakeOver } from "./useTerminal/useTakeOver";

type TerminalOptions = {
	visible: boolean;
	inactive: boolean;
	sendInput: (sessionId: string, data: string) => void;
	onOutput: (sessionId: string, handler: (data: string) => void) => () => void;
	sendResize: ResizeFn;
};

export function useTerminal(
	containerRef: RefObject<HTMLDivElement | null>,
	sessionId: string,
	{ visible, inactive, sendInput, onOutput, sendResize }: TerminalOptions,
): () => void {
	const handleRef = useRef<TerminalHandle | null>(null);
	const inactiveRef = useRef(inactive);

	useEffect(() => {
		const el = containerRef.current;
		if (!el) return;
		const { handle, cleanup } = setupTerminal(el, sessionId, {
			sendInput,
			onOutput,
			sendResize,
			isInactive: () => inactiveRef.current,
		});
		handleRef.current = handle;
		return () => {
			cleanup();
			handleRef.current = null;
		};
	}, [containerRef, sessionId, onOutput, sendInput, sendResize]);

	const takeOver = useTakeOver(
		{ containerRef, handleRef, inactiveRef },
		sessionId,
		inactive,
		sendResize,
	);

	useEffect(() => {
		const h = handleRef.current;
		if (!visible || !h) return;
		const id = setTimeout(() => {
			if (inactiveRef.current || !hasTerminalSize(containerRef.current)) return;
			h.fitAddon.fit();
			if (!isSessionCardFocusHeld()) h.term.focus();
			sendResize(sessionId, h.term.cols, h.term.rows);
		}, 50);
		return () => clearTimeout(id);
	}, [containerRef, visible, sessionId, sendResize]);

	return takeOver;
}
