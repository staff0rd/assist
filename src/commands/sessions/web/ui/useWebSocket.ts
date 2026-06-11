import { type RefObject, useCallback, useEffect, useRef } from "react";
import { createWsConnection } from "./createWsConnection";
import type { WsDispatch } from "./WsDispatch";

type OutputHandler = (data: string) => void;

type WsDeps = {
	handleSessions: WsDispatch["setSessions"];
	setHistory: WsDispatch["setHistory"];
	setActiveId: WsDispatch["setActiveId"];
	setTranscript: WsDispatch["setTranscript"];
	setViewingTranscriptSessionId: WsDispatch["setViewingTranscriptSessionId"];
	setCurrentCwd: WsDispatch["setCurrentCwd"];
	setError: WsDispatch["setError"];
	markInitialized: WsDispatch["markInitialized"];
	buffers: RefObject<Map<string, string>>;
	handlers: RefObject<Map<string, OutputHandler>>;
};

/** Own the WebSocket lifecycle: connect on mount, expose a history request. */
export function useWebSocket(deps: WsDeps) {
	const wsRef = useRef<WebSocket | null>(null);
	const { handleSessions, markInitialized } = deps;

	// biome-ignore lint/correctness/useExhaustiveDependencies: state setters and refs keep a stable identity for the connection's lifetime
	useEffect(() => {
		const ws = createWsConnection({ ...deps, setSessions: handleSessions });
		wsRef.current = ws;
		return () => ws.close();
	}, [handleSessions, markInitialized]);

	const requestHistory = useCallback(() => {
		const ws = wsRef.current;
		if (ws?.readyState === WebSocket.OPEN)
			ws.send(JSON.stringify({ type: "history" }));
	}, []);

	return { wsRef, requestHistory };
}
