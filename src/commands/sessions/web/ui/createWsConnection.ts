import { handleWsMessage } from "./handleWsMessage";
import type { WsDispatch } from "./WsDispatch";

type WsLifecycle = {
	onOpen?: () => void;
	onClose?: () => void;
};

export function createWsConnection(
	d: WsDispatch,
	lifecycle: WsLifecycle = {},
): WebSocket {
	const protocol = location.protocol === "https:" ? "wss:" : "ws:";
	const ws = new WebSocket(`${protocol}//${location.host}/ws`);

	ws.onopen = () => {
		lifecycle.onOpen?.();
		ws.send(JSON.stringify({ type: "history" }));
	};

	ws.onmessage = (e) => {
		handleWsMessage(JSON.parse(e.data), d);
	};

	ws.onclose = () => lifecycle.onClose?.();

	return ws;
}
