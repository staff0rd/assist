import { appendDaemonLog } from "./daemon/appendDaemonLog";
import { sendToDaemon } from "./daemon/sendToDaemon";

// why: invoked by Claude Code hooks inside a daemon-spawned session, so a missing
// ASSIST_SESSION_ID (run outside the daemon) or an absent daemon must exit 0
// silently rather than surface an error into the session
export async function setSessionStatus(status: string): Promise<void> {
	const sessionId = process.env.ASSIST_SESSION_ID;
	logHookFired(status, sessionId);
	if (!sessionId) return;
	try {
		await sendToDaemon({ type: "set-status", sessionId, status });
	} catch {
		// daemon not running — status push is best-effort
	}
}

function logHookFired(status: string, sessionId: string | undefined): void {
	appendDaemonLog(
		`set-status hook fired: id=${sessionId ?? "none"} status=${status}`,
	);
}
