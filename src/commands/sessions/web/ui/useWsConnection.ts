import { useEffect, useRef, useState } from "react";
import type { SessionInfo } from "./types";

type OutputHandler = (data: string) => void;

export function useWsConnection() {
	const [sessions, setSessions] = useState<SessionInfo[]>([]);
	const [activeId, setActiveId] = useState<string | null>(null);
	const wsRef = useRef<WebSocket | null>(null);
	const buffers = useRef(new Map<string, string>());
	const handlers = useRef(new Map<string, OutputHandler>());

	useEffect(() => {
		const protocol = location.protocol === "https:" ? "wss:" : "ws:";
		const ws = new WebSocket(`${protocol}//${location.host}/ws`);
		wsRef.current = ws;

		ws.onmessage = (e) => {
			const msg = JSON.parse(e.data);
			if (msg.type === "sessions") setSessions(msg.sessions);
			else if (msg.type === "created") setActiveId(msg.sessionId);
			else if (msg.type === "output") {
				const prev = buffers.current.get(msg.sessionId) ?? "";
				buffers.current.set(msg.sessionId, prev + msg.data);
				handlers.current.get(msg.sessionId)?.(msg.data);
			}
		};

		return () => ws.close();
	}, []);

	return { sessions, activeId, setActiveId, wsRef, buffers, handlers };
}
