import { useCallback, useEffect, useRef, useState } from "react";
import type { HistoricalSession, SessionInfo } from "./types";

type OutputHandler = (data: string) => void;

export function useWsConnection() {
	const [sessions, setSessions] = useState<SessionInfo[]>([]);
	const [history, setHistory] = useState<HistoricalSession[]>([]);
	const [activeId, setActiveId] = useState<string | null>(null);
	const wsRef = useRef<WebSocket | null>(null);
	const buffers = useRef(new Map<string, string>());
	const handlers = useRef(new Map<string, OutputHandler>());

	useEffect(() => {
		const protocol = location.protocol === "https:" ? "wss:" : "ws:";
		const ws = new WebSocket(`${protocol}//${location.host}/ws`);
		wsRef.current = ws;

		ws.onopen = () => {
			ws.send(JSON.stringify({ type: "history" }));
		};

		ws.onmessage = (e) => {
			const msg = JSON.parse(e.data);
			if (msg.type === "sessions") setSessions(msg.sessions);
			else if (msg.type === "created") setActiveId(msg.sessionId);
			else if (msg.type === "history") setHistory(msg.sessions);
			else if (msg.type === "output") {
				const prev = buffers.current.get(msg.sessionId) ?? "";
				buffers.current.set(msg.sessionId, prev + msg.data);
				handlers.current.get(msg.sessionId)?.(msg.data);
			}
		};

		return () => ws.close();
	}, []);

	const requestHistory = useCallback(() => {
		const ws = wsRef.current;
		if (ws?.readyState === WebSocket.OPEN)
			ws.send(JSON.stringify({ type: "history" }));
	}, []);

	return {
		sessions,
		history,
		activeId,
		setActiveId,
		wsRef,
		buffers,
		handlers,
		requestHistory,
	};
}
