export type { SessionInfo } from "./types";

import { useActiveSelectionSync } from "./useActiveSelectionSync";
import { useReportRenderedStatus } from "./useReportRenderedStatus";
import { useSend } from "./useSend";
import { useSessionActions } from "./useSessionActions";
import { useTranscriptNavigation } from "./useTranscriptNavigation";
import { useWsConnection } from "./useWsConnection";

export type SessionSocket = ReturnType<typeof useSessionSocket>;

export function useSessionSocket() {
	const conn = useWsConnection();
	const { wsRef, buffers, handlers, addPendingLaunch, activeId, sessions } =
		conn;

	const send = useSend(wsRef, addPendingLaunch);
	const actions = useSessionActions(send, buffers, handlers);
	useActiveSelectionSync(activeId, sessions, conn.history, send);
	useReportRenderedStatus(sessions, send);

	const nav = useTranscriptNavigation(
		send,
		conn.setActiveId,
		conn.setViewingTranscriptSessionId,
	);

	return { ...conn, ...actions, ...nav };
}
