import { getInstallDir, isGitRepo } from "../../../../shared/getInstallDir";
import { daemonLog } from "../daemonLog";
import type { TreeSpawnContext } from "../worktree/allocateAndBind";
import { autoUpdateControl } from "./autoUpdateControl";
import { autoUpdateEnabled } from "./autoUpdateEnabled";
import { autoUpdateState } from "./autoUpdateState";
import { headCommit } from "../../../watch/headCommit";
import { runAutoUpdateLoop } from "./runAutoUpdateLoop";
import { trimWatcherLog } from "./trimWatcherLog";
import { loopDeps } from "./loopDeps";

function stayOff(reason: string): void {
	autoUpdateState.enter("off", { reason });
	daemonLog(`auto-update: off (${reason})`);
}

export function startAutoUpdate(ctx: () => TreeSpawnContext): void {
	const installDir = getInstallDir();
	if (!isGitRepo(installDir)) {
		stayOff(`${installDir} is not a git clone`);
		return;
	}
	autoUpdateState.setStartCommit(headCommit(installDir));
	if (!autoUpdateEnabled(installDir)) {
		stayOff("autoUpdate.enabled is false");
		return;
	}
	trimWatcherLog(installDir);
	daemonLog(
		autoUpdateControl.paused()
			? `auto-update: paused for ${installDir}; resume it from the Updates page`
			: `auto-update: pulling and building ${installDir} as origin moves`,
	);
	void runAutoUpdateLoop(loopDeps(installDir, ctx)).catch((error) =>
		daemonLog(
			`auto-update: loop stopped: ${error instanceof Error ? error.message : String(error)}`,
		),
	);
}
