import { mkdirSync } from "node:fs";
import { broadcast } from "./broadcast";
import { isDaemonRunning } from "./connectToDaemon";
import { createAutoExit } from "./createAutoExit";
import { daemonLog, setDaemonLogSink } from "./daemonLog";
import { daemonPaths } from "./daemonPaths";
import { pollRepoConfigCache } from "./pollRepoConfigCache";
import { refreshRepoConfigCacheOnStart } from "./refreshRepoConfigCacheOnStart";
import { SessionManager } from "./SessionManager";
import { startDaemonLogTrimmer } from "./startDaemonLogTrimmer";
import { startDaemonServer } from "./startDaemonServer";
import { startInboxScans } from "./startInboxScans";

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
	startDaemonLogTrimmer();
	pollRepoConfigCache();
	startInboxScans(() => broadcast(manager.clients, { type: "inbox" }));
	await startDaemonServer(manager, checkAutoExit);
	await refreshRepoConfigCacheOnStart();
}
