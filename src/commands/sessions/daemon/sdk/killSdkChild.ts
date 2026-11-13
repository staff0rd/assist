import type { ChildProcess } from "node:child_process";

export function killSdkChild(child: ChildProcess | undefined): void {
	if (!child?.pid || child.exitCode !== null) return;
	try {
		if (process.platform === "win32") child.kill();
		else process.kill(-child.pid, "SIGTERM");
	} catch {
		child.kill();
	}
}
