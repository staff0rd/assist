import type { ChildProcess } from "node:child_process";

const liveChildren = new Set<ChildProcess>();
let exitHookInstalled = false;

export function killOrphanOnDaemonExit(child: ChildProcess): void {
	liveChildren.add(child);
	child.once("exit", () => liveChildren.delete(child));
	if (exitHookInstalled) return;
	exitHookInstalled = true;
	process.once("exit", () => {
		for (const live of liveChildren) live.kill();
	});
}
