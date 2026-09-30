import { spawn } from "node:child_process";
import { daemonLog } from "../daemonLog";
import { installInvocation } from "./installInvocation";
import { trackInstall, untrackInstall } from "./stopInstall";

const STDERR_TAIL = 2000;

type InstallOutcome = { ok: boolean; stopped: boolean };

export function spawnInstall(
	worktreePath: string,
	cwd: string,
	command: string,
	where: string,
	onDone: (outcome: InstallOutcome) => void,
): void {
	daemonLog(`worktree ${worktreePath} installing deps${where}: ${command}`);
	const child = spawn(...installInvocation(cwd, command));
	trackInstall(worktreePath, child);
	let stderr = "";
	child.stderr?.on("data", (chunk: Buffer) => {
		stderr = (stderr + chunk.toString()).slice(-STDERR_TAIL);
	});
	let settled = false;
	const settle = (ok: boolean, outcome: string) => {
		if (settled) return;
		settled = true;
		const stopped = !untrackInstall(worktreePath, child);
		daemonLog(`worktree ${worktreePath} install${where} ${outcome}`);
		onDone({ ok, stopped });
	};
	child.on("error", (error) =>
		settle(false, `failed to start: ${error.message}`),
	);
	child.on("close", (code, signal) =>
		settle(
			code === 0,
			code === 0
				? "complete"
				: `failed (${signal ? `signal ${signal}` : `exit ${code}`}): ${stderr.trim() || "no output"}`,
		),
	);
}
