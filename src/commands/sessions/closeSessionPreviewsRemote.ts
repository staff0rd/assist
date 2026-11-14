import { appendDaemonLog } from "./daemon/appendDaemonLog";
import { sendToDaemonAwaitAck } from "./daemon/sendToDaemonAwaitAck";

export async function closeSessionPreviewsRemote(
	sessionId: string | undefined,
	reason: string,
): Promise<void> {
	if (!sessionId) return;
	try {
		await sendToDaemonAwaitAck({ type: "close-previews", sessionId, reason });
	} catch (error) {
		appendDaemonLog(
			`close-previews send failed: id=${sessionId} (${reason}): ${error instanceof Error ? error.message : String(error)}`,
		);
	}
}
