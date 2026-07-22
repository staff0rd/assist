import { type ReactNode, useMemo } from "react";
import { ServerConflictDialog } from "./ServerConflictDialog";
import { ServerActionsContext } from "./useServerActionsContext";
import type { SessionSocket } from "./useSessionSocket";

export function ServerRunLayer({
	socket,
	children,
}: {
	socket: SessionSocket;
	children: ReactNode;
}) {
	const {
		serverConflict,
		clearServerConflict,
		retrySession,
		stopSession,
		startRun,
	} = socket;
	const value = useMemo(
		() => ({ onStop: stopSession, onStart: startRun }),
		[stopSession, startRun],
	);
	const replace = () => {
		if (!serverConflict) return;
		if (serverConflict.runName)
			startRun(serverConflict.runName, serverConflict.cwd, true);
		else if (serverConflict.sessionId)
			retrySession(serverConflict.sessionId, true);
		clearServerConflict();
	};
	return (
		<ServerActionsContext.Provider value={value}>
			{children}
			{serverConflict && (
				<ServerConflictDialog
					conflict={serverConflict}
					onConfirm={replace}
					onCancel={clearServerConflict}
				/>
			)}
		</ServerActionsContext.Provider>
	);
}
