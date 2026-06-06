import { handleWsMessage, type WsDispatch } from "./handleWsMessage";

export function createWsConnection(d: WsDispatch): WebSocket {
	const protocol = location.protocol === "https:" ? "wss:" : "ws:";
	const ws = new WebSocket(`${protocol}//${location.host}/ws`);

	ws.onopen = () => {
		ws.send(JSON.stringify({ type: "history" }));
	};

	ws.onmessage = (e) => {
		handleWsMessage(JSON.parse(e.data), d);
	};

	return ws;
}
