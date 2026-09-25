import { appendDaemonLog } from "../sessions/daemon/appendDaemonLog";
import { sendToDaemon } from "../sessions/daemon/sendToDaemon";
import { inWebSession } from "../sessions/shared/inWebSession";

export async function reportCwdToDaemon(cwd: string): Promise<void> {
	if (!inWebSession()) return;
	const sessionId = process.env.ASSIST_SESSION_ID as string;
	try {
		await sendToDaemon({ type: "set-cwd", sessionId, cwd });
	} catch (error) {
		appendDaemonLog(
			`set-cwd send failed: id=${sessionId}: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
}
