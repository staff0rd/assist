import type { WebSocket } from "ws";

export function wsSend(ws: WebSocket, msg: object): void {
	if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(msg));
}

export function wsBroadcast(clients: Set<WebSocket>, msg: object): void {
	const json = JSON.stringify(msg);
	for (const ws of clients) {
		if (ws.readyState === ws.OPEN) ws.send(json);
	}
}
