import chalk from "chalk";
import { isGitRepo } from "../../shared/getInstallDir";
import { startWebServer } from "../../shared/web";
import { ensureDaemonRunning } from "./daemon/ensureDaemonRunning";
import { repoGroupForCwd } from "./daemon/repoGroupForCwd";
import { attachSessionSocket } from "./web/attachSessionSocket";
import { handleRequest } from "./web/handleRequest";
import type { RelayContext } from "./web/handleSocket";
import { installRestartMenu } from "./web/restartMenu/installRestartMenu";
import { streamDaemonLogs } from "./web/streamDaemonLogs";

function repoEntryCwd(serverCwd: string): string {
	return repoGroupForCwd(serverCwd)?.clone ?? serverCwd;
}

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
		repoCwd: isGitRepo(serverCwd) ? repoEntryCwd(serverCwd) : undefined,
	};

	attachSessionSocket(server, ctx);
	installRestartMenu();

	// why: keep a dedicated daemon log subscription open so daemonLog output reaches the web server's stdout (assist.log) regardless of whether a browser tab is connected.
	streamDaemonLogs();

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
