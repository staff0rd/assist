import { type RefObject, useCallback } from "react";
import type { NewLaunchInput } from "../PendingLaunch";
import { pendingLaunchFromMessage } from "./useSend/pendingLaunchFromMessage";

export function useSend(
	wsRef: RefObject<WebSocket | null>,
	addPendingLaunch: (input: NewLaunchInput) => void,
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
