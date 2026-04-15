import type { WebSocket } from "ws";
import { dispatchMessage } from "./dispatchMessage";
import type { SessionManager } from "./SessionManager";

export function handleSocket(ws: WebSocket, manager: SessionManager): void {
	manager.addClient(ws);

	ws.on("message", (msg) => {
		let data: Record<string, unknown>;
		try {
			data = JSON.parse(msg.toString());
		} catch {
			return;
		}
		dispatchMessage(ws, manager, data);
	});

	ws.on("close", () => {
		manager.removeClient(ws);
	});
}
