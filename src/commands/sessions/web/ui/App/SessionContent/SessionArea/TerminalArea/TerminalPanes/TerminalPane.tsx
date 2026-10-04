import Box from "@mui/material/Box";
import { useRef } from "react";
import type { Ownership } from "./Ownership";
import type { ResizeFn } from "../ResizeFn";
import { TakeOverOverlay } from "./TerminalPane/TakeOverOverlay";
import { useTerminal } from "./TerminalPane/useTerminal";

export function TerminalPane({
	sessionId,
	visible,
	ownership,
	activeNode,
	onOutput,
	sendInput,
	sendResize,
}: {
	sessionId: string;
	visible: boolean;
	ownership: Ownership;
	activeNode?: string;
	onOutput: (sessionId: string, handler: (data: string) => void) => () => void;
	sendInput: (sessionId: string, data: string) => void;
	sendResize: ResizeFn;
}) {
	const containerRef = useRef<HTMLDivElement>(null);
	const inactive = ownership === "other";
	const takeOver = useTerminal(containerRef, sessionId, {
		visible,
		ownership,
		sendInput,
		onOutput,
		sendResize,
	});

	return (
		<Box
			data-terminal-session-id={sessionId}
			sx={{
				position: "absolute",
				inset: "0 0 0 8px",
				visibility: visible ? "visible" : "hidden",
				pointerEvents: visible ? "auto" : "none",
			}}
			onPointerDownCapture={inactive ? takeOver : undefined}
		>
			<Box
				ref={containerRef}
				sx={{ position: "absolute", inset: 0, isolation: "isolate" }}
			/>
			{inactive && <TakeOverOverlay activeNode={activeNode} />}
		</Box>
	);
}
