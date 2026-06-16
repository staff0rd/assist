import { useCallback, useRef, useState } from "react";
import type { RateLimits } from "../../../../shared/RateLimits";
import type { HistoricalSession, SessionInfo, Transcript } from "./types";
import { useActiveIdReconciler } from "./useActiveIdReconciler";
import { useInitialized } from "./useInitialized";
import { useWebSocket } from "./useWebSocket";

type OutputHandler = (data: string) => void;

export function useWsConnection() {
	const [sessions, setSessions] = useState<SessionInfo[]>([]);
	const [history, setHistory] = useState<HistoricalSession[]>([]);
	const [activeId, setActiveId] = useState<string | null>(null);
	const [transcript, setTranscript] = useState<Transcript | null>(null);
	const [viewingTranscriptSessionId, setViewingTranscriptSessionId] = useState<
		string | null
	>(null);
	const [currentCwd, setCurrentCwd] = useState<string>("");
	const [error, setError] = useState<string | null>(null);
	const [rateLimits, setRateLimits] = useState<RateLimits | null>(null);
	const { initialized, markInitialized, syncSessions } = useInitialized();
	const buffers = useRef(new Map<string, string>());
	const handlers = useRef(new Map<string, OutputHandler>());

	const handleSessions = useCallback(
		(next: SessionInfo[]) => {
			syncSessions(next);
			setSessions(next);
		},
		[syncSessions],
	);

	const { wsRef, requestHistory, reconnecting } = useWebSocket({
		handleSessions,
		setHistory,
		setActiveId,
		setTranscript,
		setViewingTranscriptSessionId,
		setCurrentCwd,
		setError,
		setRateLimits,
		markInitialized,
		buffers,
		handlers,
	});

	useActiveIdReconciler(sessions, setActiveId);

	const clearError = useCallback(() => setError(null), []);

	return {
		sessions,
		history,
		activeId,
		setActiveId,
		transcript,
		viewingTranscriptSessionId,
		setViewingTranscriptSessionId,
		currentCwd,
		error,
		clearError,
		rateLimits,
		initialized,
		wsRef,
		buffers,
		handlers,
		requestHistory,
		reconnecting,
	};
}
