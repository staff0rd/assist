import { appendDaemonLog } from "./daemon/appendDaemonLog";
import { sendToDaemon } from "./daemon/sendToDaemon";
import { inWebSession } from "./shared/inWebSession";

export async function closeSession(): Promise<void> {
	if (!inWebSession()) {
		console.log("No daemon-managed session to close.");
		return;
	}
	const sessionId = process.env.ASSIST_SESSION_ID as string;
	try {
		await sendToDaemon({ type: "dismiss", sessionId, closeServerRuns: true });
	} catch (error) {
		appendDaemonLog(
			`close send failed: id=${sessionId}: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
}
