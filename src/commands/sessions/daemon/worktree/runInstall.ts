import { resolve } from "node:path";
import { daemonLog } from "../daemonLog";
import { detectInstallCommand } from "./detectInstallCommand";
import { resolveInstallCommand } from "./resolveInstallCommand";
import { spawnInstall } from "./spawnInstall";

export function runInstall(
	worktreePath: string,
	clone: string,
	install: boolean | string | string[],
	onSeeded: () => void,
): void {
	if (Array.isArray(install)) {
		installPaths(worktreePath, install, onSeeded);
		return;
	}
	const command = resolveInstallCommand(clone, install);
	if (!command) {
		onSeeded();
		return;
	}
	spawnInstall(worktreePath, worktreePath, command, "", () => onSeeded());
}

function installPaths(
	worktreePath: string,
	paths: string[],
	onSeeded: () => void,
): void {
	const next = (index: number): void => {
		const rel = paths[index];
		if (rel === undefined) {
			onSeeded();
			return;
		}
		const dir = resolve(worktreePath, rel);
		const command = detectInstallCommand(dir);
		if (!command) {
			daemonLog(
				`worktree ${worktreePath} install in ${rel} failed: no package.json at ${dir}; skipping remaining paths`,
			);
			onSeeded();
			return;
		}
		spawnInstall(worktreePath, dir, command, ` in ${rel}`, (outcome) => {
			if (outcome.ok && !outcome.stopped) {
				next(index + 1);
				return;
			}
			if (index < paths.length - 1)
				daemonLog(
					`worktree ${worktreePath} install skipping remaining paths: ${paths.slice(index + 1).join(", ")}`,
				);
			onSeeded();
		});
	};
	next(0);
}
