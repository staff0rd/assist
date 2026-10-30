import { apiWsUrl } from "../../../../apiUrl";
import { handleWsMessage } from "./createWsConnection/handleWsMessage";
import type { WsDispatch } from "../WsDispatch";

type WsLifecycle = {
	onOpen?: () => void;
	onClose?: () => void;
};

export function createWsConnection(
	d: WsDispatch,
	lifecycle: WsLifecycle = {},
): WebSocket {
	const ws = new WebSocket(apiWsUrl("/ws"));

	ws.onopen = () => {
		lifecycle.onOpen?.();
		ws.send(JSON.stringify({ type: "hello" }));
		ws.send(JSON.stringify({ type: "history" }));
	};

	ws.onmessage = (e) => {
		handleWsMessage(JSON.parse(e.data), d);
	};

	ws.onclose = () => lifecycle.onClose?.();

	return ws;
}
