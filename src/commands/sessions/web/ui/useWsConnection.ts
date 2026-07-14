import { useRef, useState } from "react";
import type { RateLimits } from "../../../../shared/RateLimits";
import type { HistoricalSession, SessionInfo, Transcript } from "./types";
import { useActiveIdReconciler } from "./useActiveIdReconciler";
import { useDaemonState } from "./useDaemonState";
import { useInitialized } from "./useInitialized";
import { useNotices } from "./useNotices";
import { usePendingLaunches } from "./usePendingLaunches";
import { useSessionsSync } from "./useSessionsSync";
import { useWebSocket } from "./useWebSocket";

export function useWsConnection() {
	const [sessions, setSessions] = useState<SessionInfo[]>([]);
	const [history, setHistory] = useState<HistoricalSession[]>([]);
	const [activeId, setActiveId] = useState<string | null>(null);
	const daemon = useDaemonState();
	const [transcript, setTranscript] = useState<Transcript | null>(null);
	const [viewingTranscriptSessionId, setViewingTranscriptSessionId] = useState<
		string | null
	>(null);
	const [currentCwd, setCurrentCwd] = useState<string>("");
	const notices = useNotices();
	const pending = usePendingLaunches();
	const [rateLimits, setRateLimits] = useState<RateLimits | null>(null);
	const { initialized, markInitialized, syncSessions } = useInitialized();
	const buffers = useRef(new Map<string, string>());
	const handlers = useRef(new Map<string, (data: string) => void>());
	const handleSessions = useSessionsSync(syncSessions, setSessions);

	const { wsRef, requestHistory, reconnecting } = useWebSocket({
		handleSessions,
		setHistory,
		setActiveId,
		...daemon,
		setTranscript,
		setViewingTranscriptSessionId,
		setCurrentCwd,
		...notices,
		...pending,
		setRateLimits,
		markInitialized,
		buffers,
		handlers,
	});

	useActiveIdReconciler(sessions, setActiveId, daemon.daemonActiveId);

	return {
		sessions,
		history,
		activeId,
		setActiveId,
		...daemon,
		transcript,
		viewingTranscriptSessionId,
		setViewingTranscriptSessionId,
		currentCwd,
		...notices,
		...pending,
		rateLimits,
		initialized,
		wsRef,
		buffers,
		handlers,
		requestHistory,
		reconnecting,
	};
}
