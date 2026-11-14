import { execFile } from "node:child_process";

export function killTree(pid: number): void {
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
