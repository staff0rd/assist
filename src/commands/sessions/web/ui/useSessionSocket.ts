import { useCallback, useMemo } from "react";

export type { SessionInfo } from "./types";

import {
	createRunSessionAction,
	createSessionAction,
	dismissSessionAction,
	inputAction,
	outputAction,
	requestRunConfigsAction,
	resizeAction,
	resumeSessionAction,
} from "./createSessionAction";
import { useWsConnection } from "./useWsConnection";

type SendFn = (msg: object) => void;

function useActions(send: SendFn) {
	return {
		createSession: useMemo(() => createSessionAction(send), [send]),
		createRunSession: useMemo(() => createRunSessionAction(send), [send]),
		requestRunConfigs: useMemo(() => requestRunConfigsAction(send), [send]),
		resumeSession: useMemo(() => resumeSessionAction(send), [send]),
		sendInput: useMemo(() => inputAction(send), [send]),
		sendResize: useMemo(() => resizeAction(send), [send]),
	};
}

export function useSessionSocket() {
	const {
		sessions,
		history,
		runConfigs,
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

	const actions = useActions(send);
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
		runConfigs,
		activeId,
		setActiveId,
		currentCwd,
		...actions,
		dismissSession,
		onOutput,
		requestHistory,
	};
}
