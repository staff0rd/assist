import { useState } from "react";
import { resolveActiveId } from "./useWsConnection/resolveActiveId";
import type { HistoricalSession } from "../types";
import { useActiveId } from "./useWsConnection/useActiveId";
import { useActiveIdReconciler } from "./useWsConnection/useActiveIdReconciler";
import { useDaemonState } from "./useWsConnection/useDaemonState";
import { useInitialized } from "./useWsConnection/useInitialized";
import { useNotices } from "../useNotices";
import { usePendingLaunches } from "./useWsConnection/usePendingLaunches";
import { useRateLimitsState } from "./useWsConnection/useRateLimitsState";
import { useSessionsSync } from "./useWsConnection/useSessionsSync";
import { useTerminalRefs } from "./useWsConnection/useTerminalRefs";
import { useTranscriptState } from "./useWsConnection/useTranscriptState";
import { useWebSocket } from "./useWsConnection/useWebSocket";

export function useWsConnection() {
	const [history, setHistory] = useState<HistoricalSession[]>([]);
	const { activeId, setActiveId, getActiveId } = useActiveId();
	const daemon = useDaemonState();
	const transcripts = useTranscriptState();
	const [currentCwd, setCurrentCwd] = useState<string>("");
	const notices = useNotices();
	const pending = usePendingLaunches();
	const limits = useRateLimitsState();
	const { initialized, markInitialized, syncSessions } = useInitialized();
	const terminals = useTerminalRefs();
	const { sessions, sessionsLoaded, handleSessions } =
		useSessionsSync(syncSessions);

	const { wsRef, requestHistory, reconnecting } = useWebSocket({
		handleSessions,
		setHistory,
		getActiveId,
		setActiveId,
		...daemon,
		...transcripts,
		setCurrentCwd,
		...notices,
		...pending,
		...limits,
		markInitialized,
		...terminals,
	});

	useActiveIdReconciler(
		sessions,
		setActiveId,
		resolveActiveId(daemon.activeByRepo, sessions),
	);

	return {
		sessions,
		sessionsLoaded,
		history,
		activeId,
		setActiveId,
		...daemon,
		...transcripts,
		currentCwd,
		...notices,
		...pending,
		...limits,
		initialized,
		wsRef,
		...terminals,
		requestHistory,
		reconnecting,
	};
}
