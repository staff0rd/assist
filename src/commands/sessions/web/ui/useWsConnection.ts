import { useRef, useState } from "react";
import type { RateLimits } from "../../../../shared/RateLimits";
import type { HistoricalSession, SessionInfo, Transcript } from "./types";
import { useActiveIdReconciler } from "./useActiveIdReconciler";
import { useDaemonState } from "./useDaemonState";
import { useInitialized } from "./useInitialized";
import { useNotices } from "./useNotices";
import { useSessionsSync } from "./useSessionsSync";
import { useWebSocket } from "./useWebSocket";

type OutputHandler = (data: string) => void;

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
	const [rateLimits, setRateLimits] = useState<RateLimits | null>(null);
	const { initialized, markInitialized, syncSessions } = useInitialized();
	const buffers = useRef(new Map<string, string>());
	const handlers = useRef(new Map<string, OutputHandler>());
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
		daemonVersion: daemon.daemonVersion,
		transcript,
		viewingTranscriptSessionId,
		setViewingTranscriptSessionId,
		currentCwd,
		...notices,
		rateLimits,
		initialized,
		wsRef,
		buffers,
		handlers,
		requestHistory,
		reconnecting,
	};
}
