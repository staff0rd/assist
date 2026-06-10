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

	const actions = useSessionActions(send, buffers, handlers, setActiveId);

	return {
		sessions,
		history,
		activeId,
		setActiveId,
		currentCwd,
		error,
		clearError,
		initialized,
		...actions,
		requestHistory,
	};
}
