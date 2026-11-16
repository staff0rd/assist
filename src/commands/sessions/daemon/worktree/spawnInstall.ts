import { spawn } from "node:child_process";
import { daemonLog } from "../daemonLog";
import { installInvocation } from "./installInvocation";
import type { InstallOutcome } from "./SeedOutcome";
import { resolveInstallNode } from "./resolveInstallNode";
import { trackInstall } from "./stopInstall";
import { watchInstall } from "./watchInstall";

export function spawnInstall(
	worktreePath: string,
	cwd: string,
	command: string,
	where: string,
	onDone: (outcome: InstallOutcome) => void,
): void {
	daemonLog(`worktree ${worktreePath} installing deps${where}: ${command}`);
	const node = resolveInstallNode(cwd, worktreePath);
	if (!node.ok) {
		daemonLog(
			`worktree ${worktreePath} install${where} not run: ${node.error}`,
		);
		onDone({ ok: false, stopped: false, reason: node.error, output: "" });
		return;
	}
	daemonLog(
		`worktree ${worktreePath} install${where} runs on ${node.description}`,
	);
	const child = spawn(...installInvocation(cwd, command, node.binDir));
	trackInstall(worktreePath, child);
	watchInstall(worktreePath, child, command, where, onDone);
}
