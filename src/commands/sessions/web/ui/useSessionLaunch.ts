import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router";
import type { useSessionSocket } from "./useSessionSocket";

export function useSessionLaunch(socket: ReturnType<typeof useSessionSocket>) {
	const launch = useMemo(
		() => ({ launchAssist: socket.createAssistSession }),
		[socket.createAssistSession],
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
