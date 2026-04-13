import type { WebSocket } from "ws";
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

		switch (data.type) {
			case "create": {
				const id = manager.spawn(data.prompt as string | undefined);
				ws.send(JSON.stringify({ type: "created", sessionId: id }));
				break;
			}
			case "input":
				manager.writeToSession(data.sessionId as string, data.data as string);
				break;
			case "resize":
				manager.resizeSession(
					data.sessionId as string,
					data.cols as number,
					data.rows as number,
				);
				break;
			case "resume": {
				const id = manager.resume(
					data.sessionId as string,
					data.cwd as string,
					data.name as string | undefined,
				);
				ws.send(JSON.stringify({ type: "created", sessionId: id }));
				break;
			}
			case "dismiss":
				manager.dismissSession(data.sessionId as string);
				break;
			case "history":
				manager.getHistory().then((history) => {
					ws.send(JSON.stringify({ type: "history", sessions: history }));
				});
				break;
		}
	});

	ws.on("close", () => {
		manager.removeClient(ws);
	});
}
