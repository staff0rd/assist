import { installPaths } from "./installPaths";
import { resolveInstallCommand } from "./resolveInstallCommand";
import { spawnInstall } from "./spawnInstall";

export function runInstall(
	worktreePath: string,
	clone: string,
	install: boolean | string | string[],
	onSeeded: () => void,
	onInstalling: (path?: string) => void = () => {},
): void {
	if (Array.isArray(install)) {
		installPaths(worktreePath, install, onSeeded, onInstalling);
		return;
	}
	const command = resolveInstallCommand(clone, install);
	if (!command) {
		onSeeded();
		return;
	}
	onInstalling();
	spawnInstall(worktreePath, worktreePath, command, "", () => onSeeded());
}
