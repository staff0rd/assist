import { appendDaemonLog } from "./daemon/appendDaemonLog";
import { sendToDaemon } from "./daemon/sendToDaemon";
import { inWebSession } from "./shared/inWebSession";

export async function renameSession(title: string): Promise<void> {
	if (!inWebSession()) {
		console.log("No daemon-managed session to rename.");
		return;
	}
	const sessionId = process.env.ASSIST_SESSION_ID as string;
	try {
		await sendToDaemon({ type: "rename", sessionId, title });
	} catch (error) {
		appendDaemonLog(
			`rename send failed: id=${sessionId}: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
}
