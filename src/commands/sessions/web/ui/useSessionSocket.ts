export type { SessionInfo } from "./types";

import { useActiveSelectionSync } from "./useActiveSelectionSync";
import { useReportRenderedStatus } from "./useReportRenderedStatus";
import { useSend } from "./useSend";
import { useSessionActions } from "./useSessionActions";
import { useTranscriptNavigation } from "./useTranscriptNavigation";
import { useWsConnection } from "./useWsConnection";

export type SessionSocket = ReturnType<typeof useSessionSocket>;

export function useSessionSocket() {
	const {
		sessions,
		history,
		activeId,
		setActiveId,
		daemonVersion,
		transcript,
		viewingTranscriptSessionId,
		setViewingTranscriptSessionId,
		currentCwd,
		error,
		clearError,
		success,
		setSuccess,
		clearSuccess,
		pendingLaunches,
		addPendingLaunch,
		dismissPendingLaunch,
		rateLimits,
		initialized,
		wsRef,
		buffers,
		handlers,
		requestHistory,
		reconnecting,
	} = useWsConnection();

	const send = useSend(wsRef, addPendingLaunch);

	const actions = useSessionActions(send, buffers, handlers);
	useActiveSelectionSync(activeId, sessions, history, send);
	useReportRenderedStatus(sessions, send);

	const { viewTranscript, clearTranscript, selectSession } =
		useTranscriptNavigation(send, setActiveId, setViewingTranscriptSessionId);

	return {
		sessions,
		history,
		activeId,
		setActiveId,
		daemonVersion,
		selectSession,
		transcript,
		viewingTranscriptSessionId,
		viewTranscript,
		clearTranscript,
		currentCwd,
		error,
		clearError,
		success,
		setSuccess,
		clearSuccess,
		pendingLaunches,
		dismissPendingLaunch,
		rateLimits,
		initialized,
		...actions,
		requestHistory,
		reconnecting,
	};
}
