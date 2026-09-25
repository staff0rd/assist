import { useRef, useState } from "react";
import { resolveActiveId } from "./resolveActiveId";
import type { HistoricalSession, SessionInfo } from "./types";
import { useActiveIdReconciler } from "./useActiveIdReconciler";
import { useDaemonState } from "./useDaemonState";
import { useInitialized } from "./useInitialized";
import { useNotices } from "./useNotices";
import { usePendingLaunches } from "./usePendingLaunches";
import { useRateLimitsState } from "./useRateLimitsState";
import { useSessionsSync } from "./useSessionsSync";
import { useTranscriptState } from "./useTranscriptState";
import { useWebSocket } from "./useWebSocket";

export function useWsConnection() {
	const [sessions, setSessions] = useState<SessionInfo[]>([]);
	const [history, setHistory] = useState<HistoricalSession[]>([]);
	const [activeId, setActiveId] = useState<string | null>(null);
	const daemon = useDaemonState();
	const transcripts = useTranscriptState();
	const [currentCwd, setCurrentCwd] = useState<string>("");
	const notices = useNotices();
	const pending = usePendingLaunches();
	const limits = useRateLimitsState();
	const { initialized, markInitialized, syncSessions } = useInitialized();
	const buffers = useRef(new Map<string, string>());
	const handlers = useRef(new Map<string, (data: string) => void>());
	const handleSessions = useSessionsSync(syncSessions, setSessions);

	const { wsRef, requestHistory, reconnecting } = useWebSocket({
		handleSessions,
		setHistory,
		setActiveId,
		...daemon,
		...transcripts,
		setCurrentCwd,
		...notices,
		...pending,
		...limits,
		markInitialized,
		buffers,
		handlers,
	});

	useActiveIdReconciler(
		sessions,
		setActiveId,
		resolveActiveId(daemon.activeByRepo, sessions),
	);

	return {
		sessions,
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
		buffers,
		handlers,
		requestHistory,
		reconnecting,
	};
}
