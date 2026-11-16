import type { ChildProcess } from "node:child_process";
import { daemonLog } from "../daemonLog";
import { captureOutputTail } from "./captureOutputTail";
import { closeFailure } from "./closeFailure";
import type { InstallOutcome } from "./SeedOutcome";
import { untrackInstall } from "./stopInstall";

export function watchInstall(
	worktreePath: string,
	child: ChildProcess,
	command: string,
	where: string,
	onDone: (outcome: InstallOutcome) => void,
): void {
	const tail = captureOutputTail(child);
	let settled = false;
	const settle = (failure: string | undefined) => {
		if (settled) return;
		settled = true;
		const stopped = !untrackInstall(worktreePath, child);
		const reason = stopped ? "stopped at teardown" : failure;
		if (reason === undefined) {
			daemonLog(`worktree ${worktreePath} install${where} complete`);
			onDone({ ok: true });
			return;
		}
		const output = tail();
		daemonLog(
			`worktree ${worktreePath} install${where} failed (${reason}): ${output || "no output"}`,
		);
		onDone({ ok: false, stopped, reason, output });
	};
	child.on("error", (error) => settle(`failed to start: ${error.message}`));
	child.on("close", (code, signal) =>
		settle(code === 0 ? undefined : closeFailure(command, code, signal)),
	);
}
