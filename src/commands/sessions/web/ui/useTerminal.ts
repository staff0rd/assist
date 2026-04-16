import { type RefObject, useEffect, useRef } from "react";
import type { TerminalHandle } from "./createTerminal";
import { setupTerminal } from "./setupTerminal";

type ResizeFn = (sessionId: string, cols: number, rows: number) => void;

export function useTerminal(
	containerRef: RefObject<HTMLDivElement | null>,
	sessionId: string,
	visible: boolean,
	sendInput: (sessionId: string, data: string) => void,
	onOutput: (sessionId: string, handler: (data: string) => void) => () => void,
	sendResize: ResizeFn,
) {
	const handleRef = useRef<TerminalHandle | null>(null);

	useEffect(() => {
		const el = containerRef.current;
		if (!el) return;
		const { handle, cleanup } = setupTerminal(
			el,
			sessionId,
			sendInput,
			onOutput,
			sendResize,
		);
		handleRef.current = handle;
		return () => {
			cleanup();
			handleRef.current = null;
		};
	}, [containerRef, sessionId, onOutput, sendInput, sendResize]);

	useEffect(() => {
		const h = handleRef.current;
		if (!visible || !h) return;
		const id = setTimeout(() => {
			h.fitAddon.fit();
			h.term.focus();
			sendResize(sessionId, h.term.cols, h.term.rows);
		}, 50);
		return () => clearTimeout(id);
	}, [visible, sessionId, sendResize]);
}
