import { type RefObject, useCallback } from "react";
import type { NewLaunchInput } from "../PendingLaunch";
import { pendingLaunchFromMessage } from "./useSend/pendingLaunchFromMessage";

export function useSend(
	wsRef: RefObject<WebSocket | null>,
	addPendingLaunch: (input: NewLaunchInput) => void,
) {
	return useCallback(
		(msg: object): boolean => {
			const ws = wsRef.current;
			const open = ws?.readyState === WebSocket.OPEN;
			if (open) ws.send(JSON.stringify(msg));
			const pending = pendingLaunchFromMessage(msg);
			if (pending) addPendingLaunch(pending);
			return open;
		},
		[wsRef, addPendingLaunch],
	);
}
