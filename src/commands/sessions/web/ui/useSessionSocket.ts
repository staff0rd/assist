import { useCallback } from "react";

export type { SessionInfo } from "./types";

import { useSessionActions } from "./useSessionActions";
import { useTranscriptNavigation } from "./useTranscriptNavigation";
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
		rateLimits,
		initialized,
		wsRef,
		buffers,
		handlers,
		requestHistory,
		reconnecting,
	} = useWsConnection();

	const send = useCallback(
		(msg: object) => {
			const ws = wsRef.current;
			if (ws?.readyState === WebSocket.OPEN) ws.send(JSON.stringify(msg));
		},
		[wsRef],
	);

	const actions = useSessionActions(send, buffers, handlers);

	const { viewTranscript, clearTranscript, selectSession } =
		useTranscriptNavigation(send, setActiveId, setViewingTranscriptSessionId);

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
		rateLimits,
		initialized,
		...actions,
		requestHistory,
		reconnecting,
	};
}
