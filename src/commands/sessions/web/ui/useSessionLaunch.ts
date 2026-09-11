import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router";
import type { useSessionSocket } from "./useSessionSocket";
import { useUpdateReload } from "./useUpdateReload";

export function useSessionLaunch(socket: ReturnType<typeof useSessionSocket>) {
	const { armUpdateReload } = useUpdateReload(
		socket.sessions,
		socket.reconnecting,
		socket.setSuccess,
		socket.setError,
	);
	const launch = useMemo(
		() => ({
			launchAssist: socket.createAssistSession,
			launchAgentInStream: socket.createSessionInStream,
			resumeSession: socket.resumeSession,
			armUpdateReload,
		}),
		[
			socket.createAssistSession,
			socket.createSessionInStream,
			socket.resumeSession,
			armUpdateReload,
		],
	);
	const navigate = useNavigate();
	/* oxlint-disable react-hooks/exhaustive-deps -- socket methods keep a stable identity; depending on the whole socket object (recreated each render) would needlessly recreate the callback */
	const viewLaunchedSession = useCallback(
		(sessionId: string) => {
			socket.selectSession(sessionId);
			navigate("/sessions");
			socket.clearSuccess();
		},
		[navigate, socket.selectSession, socket.clearSuccess],
	);
	/* oxlint-enable react-hooks/exhaustive-deps */

	return { launch, viewLaunchedSession };
}
