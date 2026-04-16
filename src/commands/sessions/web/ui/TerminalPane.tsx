import Box from "@mui/material/Box";
import { useRef } from "react";
import { useTerminal } from "./useTerminal";

type ResizeFn = (sessionId: string, cols: number, rows: number) => void;

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
	useTerminal(
		containerRef,
		sessionId,
		visible,
		sendInput,
		onOutput,
		sendResize,
	);

	return (
		<Box
			ref={containerRef}
			sx={{
				position: "absolute",
				inset: 0,
				visibility: visible ? "visible" : "hidden",
				pointerEvents: visible ? "auto" : "none",
			}}
		/>
	);
}
