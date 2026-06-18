import {
	type RefObject,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import { connectWithReconnect } from "./connectWithReconnect";
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
	setSuccess: WsDispatch["setSuccess"];
	setRateLimits: WsDispatch["setRateLimits"];
	markInitialized: WsDispatch["markInitialized"];
	buffers: RefObject<Map<string, string>>;
	handlers: RefObject<Map<string, OutputHandler>>;
};

/** Own the WebSocket lifecycle: connect on mount, expose a history request. */
export function useWebSocket(deps: WsDeps) {
	const wsRef = useRef<WebSocket | null>(null);
	const [reconnecting, setReconnecting] = useState(false);
	const { handleSessions, markInitialized, buffers, handlers } = deps;

	/* oxlint-disable react-hooks/exhaustive-deps -- state setters and refs keep a stable identity for the connection's lifetime */
	useEffect(() => {
		// why: the daemon replays full scrollback on every (re)connect, so a reconnect must reset terminals first or the replay appends a duplicate
		const resetTerminals = () => {
			buffers.current?.clear();
			const h = handlers.current;
			if (h) for (const write of h.values()) write("\x1bc");
		};
		const stop = connectWithReconnect(
			{ ...deps, setSessions: handleSessions },
			(ws) => {
				wsRef.current = ws;
			},
			resetTerminals,
			setReconnecting,
		);
		return () => {
			stop();
			wsRef.current?.close();
		};
	}, [handleSessions, markInitialized, buffers, handlers]);
	/* oxlint-enable react-hooks/exhaustive-deps */

	const requestHistory = useCallback(() => {
		const ws = wsRef.current;
		if (ws?.readyState === WebSocket.OPEN)
			ws.send(JSON.stringify({ type: "history" }));
	}, []);

	return { wsRef, requestHistory, reconnecting };
}
