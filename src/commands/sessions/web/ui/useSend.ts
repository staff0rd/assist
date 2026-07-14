import { type RefObject, useCallback } from "react";
import { pendingLaunchFromMessage } from "./PendingLaunch";

export function useSend(
	wsRef: RefObject<WebSocket | null>,
	addPendingLaunch: (input: { cwd?: string; title: string }) => void,
) {
	return useCallback(
		(msg: object) => {
			const ws = wsRef.current;
			if (ws?.readyState === WebSocket.OPEN) ws.send(JSON.stringify(msg));
			const pending = pendingLaunchFromMessage(msg);
			if (pending) addPendingLaunch(pending);
		},
		[wsRef, addPendingLaunch],
	);
}
