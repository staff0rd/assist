import { appendDaemonLog } from "../sessions/daemon/appendDaemonLog";
import { installFailureMessage } from "../sessions/daemon/worktree/installFailureMessage";
import { runInstall } from "../sessions/daemon/worktree/runInstall";
import { worktreeConfigFor } from "../sessions/daemon/worktree/worktreeConfigFor";
import { changedInstall } from "./changedInstall";

function installedPaths(install: true | string | string[]): string[] {
	return Array.isArray(install) ? install : ["."];
}

export function reinstallChangedDeps(
	tree: string,
	before: string | null,
): Promise<void> {
	const cfg = worktreeConfigFor(tree);
	if (!before || !cfg.enabled) return Promise.resolve();
	const install = changedInstall(tree, before, cfg.install);
	if (install === false || (Array.isArray(install) && !install.length))
		return Promise.resolve();
	const paths = installedPaths(install);
	const where = paths.join(", ");
	console.log(`Lockfile changed in ${where}; reinstalling deps…`);
	for (const rel of paths)
		appendDaemonLog(
			`worktree ${tree} reinstalling deps in ${rel}: lockfile changed by pr checkout`,
		);
	return new Promise<void>((resolve) =>
		runInstall(tree, tree, install, (outcome) => {
			if (outcome.ok)
				appendDaemonLog(`worktree ${tree} reinstalled deps in ${where}`);
			else {
				const message = installFailureMessage(tree, outcome);
				console.warn(message);
				appendDaemonLog(message);
			}
			resolve();
		}),
	);
}
