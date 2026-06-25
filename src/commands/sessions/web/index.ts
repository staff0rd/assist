import chalk from "chalk";
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

	// why: never await the daemon before binding — on WSL login the spawn can stall behind an interactive shell-init step (ssh-key passphrase prompt) and a throw here would exit before binding, needing a manual restart. Warming it in the background lets each WS connection ensure it lazily (handleSocket) while the browser auto-reconnects once it is up.
	void ensureDaemonRunning("web server start").catch((error) => {
		console.error(
			chalk.yellow(
				`sessions daemon not ready yet, will retry on connection: ${
					error instanceof Error ? error.message : String(error)
				}`,
			),
		);
	});
}
