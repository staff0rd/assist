import { type ChildProcess, execFile } from "node:child_process";
import { daemonLog } from "../daemonLog";

const running = new Map<string, ChildProcess>();

export function trackInstall(worktreePath: string, child: ChildProcess): void {
	running.set(worktreePath, child);
}

export function untrackInstall(
	worktreePath: string,
	child: ChildProcess,
): boolean {
	if (running.get(worktreePath) !== child) return false;
	running.delete(worktreePath);
	return true;
}

export function stopInstall(worktreePath: string): void {
	const child = running.get(worktreePath);
	running.delete(worktreePath);
	if (!child?.pid) return;
	daemonLog(
		`worktree ${worktreePath} install still running at teardown; killing pid ${child.pid} so removal is not racing it`,
	);
	killTree(child.pid);
}

function killTree(pid: number): void {
	if (process.platform === "win32") {
		execFile(
			"taskkill",
			["/T", "/F", "/PID", String(pid)],
			{ windowsHide: true },
			() => {},
		);
		return;
	}
	try {
		process.kill(-pid, "SIGKILL");
	} catch {
		try {
			process.kill(pid, "SIGKILL");
		} catch {}
	}
}
