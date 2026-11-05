import { type ChildProcess, execFile } from "node:child_process";
import { daemonLog } from "../daemonLog";

const running = new Map<string, Set<ChildProcess>>();

export function trackInstall(worktreePath: string, child: ChildProcess): void {
	const children = running.get(worktreePath) ?? new Set();
	children.add(child);
	running.set(worktreePath, children);
}

export function untrackInstall(
	worktreePath: string,
	child: ChildProcess,
): boolean {
	const children = running.get(worktreePath);
	if (!children?.delete(child)) return false;
	if (children.size === 0) running.delete(worktreePath);
	return true;
}

export function stopInstall(worktreePath: string): void {
	const children = running.get(worktreePath);
	running.delete(worktreePath);
	for (const child of children ?? []) {
		if (!child.pid) continue;
		daemonLog(
			`worktree ${worktreePath} install still running at teardown; killing pid ${child.pid} so removal is not racing it`,
		);
		killTree(child.pid);
	}
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
