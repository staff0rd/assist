import { daemonLog } from "../daemonLog";
import { detectInstallCommand } from "./detectInstallCommand";
import type { InstallOutcome } from "./SeedOutcome";
import { spawnInstall } from "./spawnInstall";

export function startPathInstall(
	worktreePath: string,
	rel: string,
	dir: string,
	onDone: (outcome: InstallOutcome) => void,
): void {
	const command = detectInstallCommand(dir);
	if (!command) {
		const reason = `no package.json at ${dir}`;
		daemonLog(`worktree ${worktreePath} install in ${rel} failed: ${reason}`);
		onDone({ ok: false, stopped: false, reason, output: "" });
		return;
	}
	spawnInstall(worktreePath, dir, command, ` in ${rel}`, onDone);
}
