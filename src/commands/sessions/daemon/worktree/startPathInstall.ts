import { daemonLog } from "../daemonLog";
import { detectInstallCommand } from "./detectInstallCommand";
import type { PathState } from "./pendingPathAction";
import { spawnInstall } from "./spawnInstall";

export function startPathInstall(
	worktreePath: string,
	rel: string,
	dir: string,
	onDone: (ok: boolean, stopped: boolean) => void,
): PathState {
	const command = detectInstallCommand(dir);
	if (!command) {
		daemonLog(
			`worktree ${worktreePath} install in ${rel} failed: no package.json at ${dir}`,
		);
		return "failed";
	}
	spawnInstall(worktreePath, dir, command, ` in ${rel}`, (outcome) =>
		onDone(outcome.ok && !outcome.stopped, outcome.stopped),
	);
	return "running";
}
