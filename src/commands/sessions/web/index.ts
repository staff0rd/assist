import { WebSocketServer } from "ws";
import { isGitRepo } from "../../../shared/getInstallDir";
import { startWebServer } from "../../../shared/web";
import { ensureDaemonRunning } from "../daemon/ensureDaemonRunning";
import { handleRequest } from "./handleRequest";
import { handleSocket, type RelayContext } from "./handleSocket";
import { installRestartMenu } from "./restartMenu/installRestartMenu";

export async function web(options: {
	port: string;
	initialPath?: string;
	open?: boolean;
}): Promise<void> {
	await ensureDaemonRunning("web server start");
	const port = Number.parseInt(options.port, 10);
	const server = startWebServer(
		"Assist",
		port,
		handleRequest,
		options.initialPath,
		options.open !== false,
	);
	const serverCwd = process.cwd();
	const ctx: RelayContext = {
		serverCwd,
		repoCwd: isGitRepo(serverCwd) ? serverCwd : undefined,
	};

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

	installRestartMenu();
}
