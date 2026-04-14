import { useCallback, useMemo } from "react";

export type { SessionInfo } from "./types";

import {
	createSessionAction,
	dismissSessionAction,
	inputAction,
	outputAction,
	resizeAction,
	resumeSessionAction,
} from "./createSessionAction";
import { useWsConnection } from "./useWsConnection";

export function useSessionSocket() {
	const {
		sessions,
		history,
		activeId,
		setActiveId,
		currentCwd,
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

	const createSession = useMemo(() => createSessionAction(send), [send]);
	const resumeSession = useMemo(() => resumeSessionAction(send), [send]);
	const sendInput = useMemo(() => inputAction(send), [send]);
	const sendResize = useMemo(() => resizeAction(send), [send]);
	const onOutput = useMemo(
		() => outputAction(buffers.current, handlers.current),
		[buffers, handlers],
	);

	const dismissSession = useCallback(
		(id: string) => {
			dismissSessionAction(send, buffers.current, handlers.current)(id);
			setActiveId(null);
		},
		[send, buffers, handlers, setActiveId],
	);

	return {
		sessions,
		history,
		activeId,
		setActiveId,
		currentCwd,
		createSession,
		resumeSession,
		dismissSession,
		sendInput,
		sendResize,
		onOutput,
		requestHistory,
	};
}
