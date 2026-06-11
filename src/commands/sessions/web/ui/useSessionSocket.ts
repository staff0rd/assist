import { useCallback } from "react";

export type { SessionInfo } from "./types";

import { useSessionActions } from "./useSessionActions";
import { useWsConnection } from "./useWsConnection";

export type SessionSocket = ReturnType<typeof useSessionSocket>;

export function useSessionSocket() {
	const {
		sessions,
		history,
		activeId,
		setActiveId,
		transcript,
		viewingTranscriptSessionId,
		setViewingTranscriptSessionId,
		currentCwd,
		error,
		clearError,
		initialized,
		wsRef,
		buffers,
		handlers,
		requestHistory,
	} = useWsConnection();

	const send = useCallback(
		(msg: object) => {
			const ws = wsRef.current;
			if (ws?.readyState === WebSocket.OPEN) ws.send(JSON.stringify(msg));
		},
		[wsRef],
	);

	const actions = useSessionActions(send, buffers, handlers);

	const viewTranscript = useCallback(
		(sessionId: string) => {
			setViewingTranscriptSessionId(sessionId);
			send({ type: "fetch-transcript", sessionId });
		},
		[send, setViewingTranscriptSessionId],
	);

	const clearTranscript = useCallback(() => {
		setViewingTranscriptSessionId(null);
	}, [setViewingTranscriptSessionId]);

	// why: drop the transcript view even when the active id is unchanged
	const selectSession = useCallback(
		(id: string) => {
			setViewingTranscriptSessionId(null);
			setActiveId(id);
		},
		[setActiveId, setViewingTranscriptSessionId],
	);

	return {
		sessions,
		history,
		activeId,
		setActiveId,
		selectSession,
		transcript,
		viewingTranscriptSessionId,
		viewTranscript,
		clearTranscript,
		currentCwd,
		error,
		clearError,
		initialized,
		...actions,
		requestHistory,
	};
}
