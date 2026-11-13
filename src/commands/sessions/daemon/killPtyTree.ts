import type { Session } from "./createSession";

export function killPtyTree(pty: NonNullable<Session["pty"]>): void {
	if (pty.sdk || process.platform === "win32") {
		try {
			pty.kill();
		} catch {}
		return;
	}
	try {
		process.kill(-pty.pid, "SIGHUP");
	} catch {
		try {
			pty.kill();
		} catch {}
	}
}
