import type { Server } from "node:http";
import { WebSocketServer } from "ws";
import { handleSocket, type RelayContext } from "./handleSocket";
import { onReleaseWebServerPort } from "./restartMenu/releaseWebServerPort";

export function attachSessionSocket(server: Server, ctx: RelayContext): void {
	const wss = new WebSocketServer({ noServer: true });

	server.on("upgrade", (req, socket, head) => {
		if (req.url === "/ws") {
			wss.handleUpgrade(req, socket, head, (ws) => {
				handleSocket(ws, ctx);
			});
		} else {
			socket.destroy();
		}
	});

	onReleaseWebServerPort(() => {
		for (const client of wss.clients) client.terminate();
		server.close();
		server.closeAllConnections();
	});
}
