import Box from "@mui/material/Box";
import { useRef } from "react";
import type { ResizeFn } from "../ResizeFn";
import { TakeOverOverlay } from "./TerminalPane/TakeOverOverlay";
import { useTerminal } from "./TerminalPane/useTerminal";

export function TerminalPane({
	sessionId,
	visible,
	inactive,
	activeNode,
	onOutput,
	sendInput,
	sendResize,
}: {
	sessionId: string;
	visible: boolean;
	inactive: boolean;
	activeNode?: string;
	onOutput: (sessionId: string, handler: (data: string) => void) => () => void;
	sendInput: (sessionId: string, data: string) => void;
	sendResize: ResizeFn;
}) {
	const containerRef = useRef<HTMLDivElement>(null);
	const takeOver = useTerminal(containerRef, sessionId, {
		visible,
		inactive,
		sendInput,
		onOutput,
		sendResize,
	});

	return (
		<Box
			sx={{
				position: "absolute",
				inset: "0 0 0 8px",
				visibility: visible ? "visible" : "hidden",
				pointerEvents: visible ? "auto" : "none",
			}}
		>
			<Box ref={containerRef} sx={{ position: "absolute", inset: 0 }} />
			{inactive && (
				<TakeOverOverlay activeNode={activeNode} onTakeOver={takeOver} />
			)}
		</Box>
	);
}
