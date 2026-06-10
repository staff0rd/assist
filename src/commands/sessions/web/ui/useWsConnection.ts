import { useCallback, useEffect, useRef, useState } from "react";
import { createWsConnection } from "./createWsConnection";
import type { HistoricalSession, SessionInfo } from "./types";

type OutputHandler = (data: string) => void;

export function useWsConnection() {
	const [sessions, setSessions] = useState<SessionInfo[]>([]);
	const [history, setHistory] = useState<HistoricalSession[]>([]);
	const [activeId, setActiveId] = useState<string | null>(null);
	const [currentCwd, setCurrentCwd] = useState<string>("");
	const [error, setError] = useState<string | null>(null);
	const [initialized, setInitialized] = useState<Set<string>>(new Set());
	const wsRef = useRef<WebSocket | null>(null);
	const buffers = useRef(new Map<string, string>());
	const handlers = useRef(new Map<string, OutputHandler>());

	const markInitialized = useCallback((id: string) => {
		setInitialized((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
	}, []);

	useEffect(() => {
		const ws = createWsConnection({
			setSessions,
			setHistory,
			setActiveId,
			setCurrentCwd,
			setError,
			markInitialized,
			buffers,
			handlers,
		});
		wsRef.current = ws;
		return () => ws.close();
	}, [markInitialized]);

	const requestHistory = useCallback(() => {
		const ws = wsRef.current;
		if (ws?.readyState === WebSocket.OPEN)
			ws.send(JSON.stringify({ type: "history" }));
	}, []);

	const clearError = useCallback(() => setError(null), []);

	return {
		sessions,
		history,
		activeId,
		setActiveId,
		currentCwd,
		error,
		clearError,
		initialized,
		wsRef,
		buffers,
		handlers,
		requestHistory,
	};
}
