import type { WebSocket } from "ws";
import type { SessionManager } from "./SessionManager";

type Msg = Record<string, unknown>;

function dispatch(ws: WebSocket, manager: SessionManager, data: Msg): void {
	switch (data.type) {
		case "create": {
			const id = manager.spawn(
				data.prompt as string | undefined,
				data.cwd as string | undefined,
			);
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
}

export function handleSocket(ws: WebSocket, manager: SessionManager): void {
	manager.addClient(ws);

	ws.on("message", (msg) => {
		let data: Msg;
		try {
			data = JSON.parse(msg.toString());
		} catch {
			return;
		}
		dispatch(ws, manager, data);
	});

	ws.on("close", () => {
		manager.removeClient(ws);
	});
}
