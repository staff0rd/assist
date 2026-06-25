import { mkdirSync } from "node:fs";
import { isDaemonRunning } from "./connectToDaemon";
import { createAutoExit } from "./createAutoExit";
import { daemonLog, setDaemonLogSink } from "./daemonLog";
import { daemonPaths } from "./daemonPaths";
import { SessionManager } from "./SessionManager";
import { startDaemonServer } from "./startDaemonServer";

export async function runDaemon(): Promise<void> {
	mkdirSync(daemonPaths.dir, { recursive: true });
	daemonLog(
		`starting (reason: ${process.env.ASSIST_DAEMON_SPAWN_REASON ?? "manual"})`,
	);
	if (await isDaemonRunning()) {
		daemonLog("already running; exiting");
		process.exitCode = 1;
		return;
	}

	const checkAutoExit = createAutoExit(() => {
		daemonLog("no sessions and no connected server; exiting");
		process.exit(0);
	});
	const manager = new SessionManager(checkAutoExit);
	// why: forward every daemonLog line to log subscribers (e.g. the web server) so they reach assist.log alongside web-server lifecycle output.
	setDaemonLogSink(manager.clients.emitLog);
	startDaemonServer(manager, checkAutoExit);
}
