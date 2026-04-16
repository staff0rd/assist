import { WebSocketServer } from "ws";
import { startWebServer } from "../../../shared/web";
import { handleRequest } from "./handleRequest";
import { handleSocket } from "./handleSocket";
import { SessionManager } from "./SessionManager";

export async function web(options: {
	port: string;
	initialPath?: string;
}): Promise<void> {
	const port = Number.parseInt(options.port, 10);
	const server = startWebServer(
		"Assist",
		port,
		handleRequest,
		options.initialPath,
	);
	const manager = new SessionManager();

	const wss = new WebSocketServer({ noServer: true });

	server.on("upgrade", (req, socket, head) => {
		if (req.url === "/ws") {
			wss.handleUpgrade(req, socket, head, (ws) => {
				handleSocket(ws, manager);
			});
		} else {
			socket.destroy();
		}
	});
}
