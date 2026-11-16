import { installPaths } from "./installPaths";
import { resolveInstallCommand } from "./resolveInstallCommand";
import type { SeedOutcome } from "./SeedOutcome";
import { spawnInstall } from "./spawnInstall";

export function runInstall(
	worktreePath: string,
	clone: string,
	install: boolean | string | string[],
	onSeeded: (outcome: SeedOutcome) => void,
	onInstalling: (path?: string) => void = () => {},
): void {
	if (Array.isArray(install)) {
		installPaths(worktreePath, install, onSeeded, onInstalling);
		return;
	}
	const command = resolveInstallCommand(clone, install);
	if (!command) {
		onSeeded({ ok: true });
		return;
	}
	onInstalling();
	spawnInstall(worktreePath, worktreePath, command, "", (outcome) =>
		onSeeded(
			outcome.ok
				? outcome
				: { ok: false, reason: outcome.reason, output: outcome.output },
		),
	);
}
