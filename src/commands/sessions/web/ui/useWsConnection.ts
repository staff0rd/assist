import { useCallback, useEffect, useRef, useState } from "react";
import { handleWsMessage, type WsDispatch } from "./handleWsMessage";
import type { HistoricalSession, RunConfigInfo, SessionInfo } from "./types";

type OutputHandler = (data: string) => void;

export function useWsConnection() {
	const [sessions, setSessions] = useState<SessionInfo[]>([]);
	const [history, setHistory] = useState<HistoricalSession[]>([]);
	const [runConfigs, setRunConfigs] = useState<RunConfigInfo[]>([]);
	const [activeId, setActiveId] = useState<string | null>(null);
	const [currentCwd, setCurrentCwd] = useState<string>("");
	const wsRef = useRef<WebSocket | null>(null);
	const buffers = useRef(new Map<string, string>());
	const handlers = useRef(new Map<string, OutputHandler>());

	useEffect(() => {
		const protocol = location.protocol === "https:" ? "wss:" : "ws:";
		const ws = new WebSocket(`${protocol}//${location.host}/ws`);
		wsRef.current = ws;
		const d: WsDispatch = {
			setSessions,
			setHistory,
			setRunConfigs,
			setActiveId,
			setCurrentCwd,
			buffers,
			handlers,
		};

		ws.onopen = () => {
			ws.send(JSON.stringify({ type: "history" }));
		};

		ws.onmessage = (e) => {
			handleWsMessage(JSON.parse(e.data), d);
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
		runConfigs,
		activeId,
		setActiveId,
		currentCwd,
		wsRef,
		buffers,
		handlers,
		requestHistory,
	};
}
