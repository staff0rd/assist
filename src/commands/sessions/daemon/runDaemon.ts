import { mkdirSync } from "node:fs";
import { waitForBuild } from "../../../build/waitForBuild";
import { broadcast } from "./broadcast";
import { isDaemonRunning } from "./connectToDaemon";
import { createAutoExit } from "./createAutoExit";
import { daemonLog, setDaemonLogSink } from "./daemonLog";
import { daemonPaths } from "./daemonPaths";
import { failInterruptedJobRuns } from "./failInterruptedJobRuns";
import { inboxScanner } from "./inbox/inboxScanner";
import { pollRepoConfigCache } from "./pollRepoConfigCache";
import { refreshRepoConfigCacheOnStart } from "./refreshRepoConfigCacheOnStart";
import { SessionManager } from "./SessionManager";
import { setSdkUsageSink } from "./sdk/sdkUsageSink";
import { startDaemonLogTrimmer } from "./startDaemonLogTrimmer";
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
	// why: restored sessions relaunch assist, which must not run mid-build
	await waitForBuild({ log: daemonLog });

	const checkAutoExit = createAutoExit(() => {
		daemonLog("no sessions and no connected server; exiting");
		process.exit(0);
	});
	const manager = new SessionManager(checkAutoExit);
	// why: forward every daemonLog line to log subscribers (e.g. the web server) so they reach assist.log alongside web-server lifecycle output.
	setDaemonLogSink(manager.clients.emitLog);
	// why: Claude (SDK) usage draws from the Claude plan's limits, so its observations land on the Claude account like the status line's.
	setSdkUsageSink({
		limits: (rateLimits) => manager.clients.updateLimits(rateLimits),
		usage: (claudeSessionId, transcriptPath, usedPct) =>
			manager.recordUsage(claudeSessionId, transcriptPath, usedPct),
	});
	startDaemonLogTrimmer();
	pollRepoConfigCache();
	void failInterruptedJobRuns();
	inboxScanner.start((type) => broadcast(manager.clients, { type }));
	await startDaemonServer(manager, checkAutoExit);
	await refreshRepoConfigCacheOnStart();
}
