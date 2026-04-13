import { type CSSProperties, useEffect, useRef } from "react";
import type { TerminalHandle } from "./createTerminal";
import { setupTerminal } from "./setupTerminal";

type ResizeFn = (sessionId: string, cols: number, rows: number) => void;

function paneStyle(visible: boolean): CSSProperties {
	return {
		position: "absolute",
		inset: 0,
		visibility: visible ? "visible" : "hidden",
		pointerEvents: visible ? "auto" : "none",
	};
}

export function TerminalPane({
	sessionId,
	visible,
	onOutput,
	sendInput,
	sendResize,
}: {
	sessionId: string;
	visible: boolean;
	onOutput: (sessionId: string, handler: (data: string) => void) => () => void;
	sendInput: (sessionId: string, data: string) => void;
	sendResize: ResizeFn;
}) {
	const containerRef = useRef<HTMLDivElement>(null);
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
	}, [sessionId, onOutput, sendInput, sendResize]);

	useEffect(() => {
		const h = handleRef.current;
		if (!visible || !h) return;
		const id = setTimeout(() => {
			h.fitAddon.fit();
			sendResize(sessionId, h.term.cols, h.term.rows);
		}, 50);
		return () => clearTimeout(id);
	}, [visible, sessionId, sendResize]);

	return <div ref={containerRef} style={paneStyle(visible)} />;
}
