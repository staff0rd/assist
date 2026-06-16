import { createWsConnection } from "./createWsConnection";
import type { WsDispatch } from "./WsDispatch";

export function connectWithReconnect(
	deps: WsDispatch,
	setSocket: (ws: WebSocket) => void,
	resetTerminals: () => void,
	setReconnecting: (value: boolean) => void,
): () => void {
	let disposed = false;
	let retry: ReturnType<typeof setTimeout> | undefined;
	let attempt = 0;
	let reconnecting = false;

	const connect = () => {
		if (disposed) return;
		setSocket(
			createWsConnection(deps, {
				onOpen: () => {
					if (reconnecting) resetTerminals();
					reconnecting = false;
					setReconnecting(false);
					attempt = 0;
				},
				onClose: () => {
					if (disposed) return;
					reconnecting = true;
					setReconnecting(true);
					const delay = Math.min(300 * 2 ** attempt, 2000);
					attempt += 1;
					retry = setTimeout(connect, delay);
				},
			}),
		);
	};

	connect();

	return () => {
		disposed = true;
		if (retry) clearTimeout(retry);
	};
}
