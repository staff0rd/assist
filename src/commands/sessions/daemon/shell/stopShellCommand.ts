import type { ChildProcess } from "node:child_process";
import type { Session } from "../createSession";
import { daemonLog } from "../daemonLog";
import { killTree } from "../killTree";

const running = new Map<string, Map<string, ChildProcess>>();

export function trackShellCommand(
	sessionId: string,
	shellId: string,
	child: ChildProcess,
): void {
	const children = running.get(sessionId) ?? new Map();
	children.set(shellId, child);
	running.set(sessionId, children);
}

export function untrackShellCommand(sessionId: string, shellId: string): void {
	const children = running.get(sessionId);
	children?.delete(shellId);
	if (children?.size === 0) running.delete(sessionId);
}

export function stopShellCommand(session: Session, shellId: string): boolean {
	const child = running.get(session.id)?.get(shellId);
	const row = session.sdkShell?.find((r) => r.id === shellId);
	if (!child?.pid || row?.state !== "running") return false;
	row.stopped = true;
	daemonLog(
		`session ${session.id} shell ${shellId} stopping: killing process tree of pid ${child.pid}`,
	);
	killTree(child.pid);
	return true;
}

export function stopSessionShellCommands(session: Session): void {
	for (const shellId of running.get(session.id)?.keys() ?? [])
		stopShellCommand(session, shellId);
	running.delete(session.id);
	const held = session.sdkShell?.filter((row) => row.state === "held") ?? [];
	if (held.length)
		daemonLog(
			`session ${session.id} dismissed: dropped held shell results ${held.map((row) => row.id).join(", ")}`,
		);
	session.sdkShell = undefined;
}
