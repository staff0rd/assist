export type { SessionInfo } from "./types";

import { useActiveSelectionSync } from "./useSessionSocket/useActiveSelectionSync";
import { useReportRenderedStatus } from "./useSessionSocket/useReportRenderedStatus";
import { useNodeSelection } from "./useNodeSelection";
import { useSend } from "./useSessionSocket/useSend";
import { useSessionActions } from "./useSessionSocket/useSessionActions";
import { useTranscriptNavigation } from "./useSessionSocket/useTranscriptNavigation";
import { useWsConnection } from "./useSessionSocket/useWsConnection";

export type SessionSocket = ReturnType<typeof useSessionSocket>;

export function useSessionSocket() {
	const conn = useWsConnection();
	const { wsRef, buffers, handlers, addPendingLaunch, activeId, sessions } =
		conn;

	const nodeSelection = useNodeSelection(conn.nodes);
	const send = useSend(wsRef, addPendingLaunch);
	const actions = useSessionActions(send, buffers, handlers);
	useActiveSelectionSync(activeId, sessions, conn.history, send);
	useReportRenderedStatus(sessions, send);

	const nav = useTranscriptNavigation(
		send,
		conn.setActiveId,
		conn.setViewingTranscriptSessionId,
	);

	return { ...conn, ...actions, ...nav, nodeSelection };
}
