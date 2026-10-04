import { setTimeout as sleep } from "node:timers/promises";
import { getInstallDir, isGitRepo } from "../../../../shared/getInstallDir";
import { daemonLog } from "../daemonLog";
import { watcherNote } from "../watcherNote";
import { appendWatcherLog } from "../worktree/appendWatcherLog";
import type { TreeSpawnContext } from "../worktree/allocateAndBind";
import { canonicalTreePath } from "../worktree/canonicalTreePath";
import { escalateDivergence } from "../worktree/escalateDivergence";
import { liveEscalationIn } from "../worktree/liveEscalationIn";
import { autoUpdateEnabled } from "./autoUpdateEnabled";
import { lineRecorder } from "./lineRecorder";
import type { AutoUpdateDeps } from "./AutoUpdateDeps";
import { runAutoUpdateLoop } from "./runAutoUpdateLoop";
import { runUpdateLap } from "./runUpdateLap";
import { trimWatcherLog } from "./trimWatcherLog";

function loopDeps(
	installDir: string,
	ctx: () => TreeSpawnContext,
): AutoUpdateDeps {
	const clone = canonicalTreePath(installDir);
	const logLine = lineRecorder((line) => daemonLog(`auto-update: ${line}`));
	return {
		runLap: (onOutput) => runUpdateLap(installDir, onOutput),
		record: (text) => {
			appendWatcherLog(installDir, text);
			logLine(text);
		},
		note: (text) => {
			appendWatcherLog(installDir, watcherNote(text));
			daemonLog(`auto-update: ${text}`);
		},
		liveEscalation: () => liveEscalationIn(ctx().sessions, clone)?.id,
		escalate: (output) => escalateDivergence(ctx(), installDir, output),
		isLive: (sessionId) => {
			const status = ctx().sessions.get(sessionId)?.status;
			return status !== undefined && status !== "done" && status !== "error";
		},
		sleep: (ms) => sleep(ms),
	};
}

export function startAutoUpdate(ctx: () => TreeSpawnContext): void {
	const installDir = getInstallDir();
	if (!autoUpdateEnabled(installDir)) {
		daemonLog("auto-update: off (autoUpdate.enabled is false)");
		return;
	}
	if (!isGitRepo(installDir)) {
		daemonLog(`auto-update: off (${installDir} is not a git clone)`);
		return;
	}
	trimWatcherLog(installDir);
	daemonLog(`auto-update: pulling and building ${installDir} as origin moves`);
	void runAutoUpdateLoop(loopDeps(installDir, ctx)).catch((error) =>
		daemonLog(
			`auto-update: loop stopped: ${error instanceof Error ? error.message : String(error)}`,
		),
	);
}
