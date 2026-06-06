import type { WebSocket } from "ws";
import { dispatchMessage } from "./dispatchMessage";
import type { SessionManager } from "./SessionManager";
import { wsSend } from "./wsBroadcast";

export function handleSocket(ws: WebSocket, manager: SessionManager): void {
	manager.addClient(ws);

	ws.on("message", (msg) => {
		let data: Record<string, unknown>;
		try {
			data = JSON.parse(msg.toString());
		} catch {
			return;
		}
		try {
			dispatchMessage(ws, manager, data);
		} catch (e) {
			wsSend(ws, {
				type: "error",
				message: `${data.type} failed: ${e instanceof Error ? e.message : String(e)}`,
			});
		}
	});

	ws.on("close", () => {
		manager.removeClient(ws);
	});
}
