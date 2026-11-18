import { useMemo } from "react";
import type { SessionListHandlers } from "../types";
import type { SessionSocket } from "../useSessionSocket";

export function useSessionLifecycle(
	socket: SessionSocket,
): SessionListHandlers {
	return useMemo(
		() => ({
			onRetry: socket.retrySession,
			onRestart: socket.restartSession,
			onStartOver: socket.startOverSession,
			onDismiss: socket.dismissSession,
			onSetAutoApprove: socket.setAutoApprove,
			onSetAutoAdvance: socket.setAutoAdvance,
		}),
		[
			socket.retrySession,
			socket.restartSession,
			socket.startOverSession,
			socket.dismissSession,
			socket.setAutoApprove,
			socket.setAutoAdvance,
		],
	);
}
