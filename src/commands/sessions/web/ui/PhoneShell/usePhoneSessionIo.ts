import { useRef } from "react";
import { pasteAndSubmit } from "../../../shared/pasteAndSubmit";
import type { ResizeMode } from "../ResizeFn";
import type { SessionInfo } from "../types";
import type { SessionSocket } from "../useSessionSocket";
import { viewerId } from "../viewerId";

export function usePhoneSessionIo(
	session: SessionInfo | undefined,
	socket: SessionSocket,
) {
	const reclaimRef = useRef<(() => void) | null>(null);
	const id = session?.id ?? "";
	const owned = session?.activeViewer === viewerId;

	const sendInput = (sessionId: string, data: string) => {
		if (!owned) reclaimRef.current?.();
		socket.sendInput(sessionId, data);
	};

	return {
		reclaimRef,
		sendSize: (cols: number, rows: number, mode?: ResizeMode) =>
			socket.sendResize(id, cols, rows, mode),
		onKey: (data: string) => sendInput(id, data),
		onSend: (text: string) => pasteAndSubmit(sendInput, id, text),
	};
}
