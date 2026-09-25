import { appendDaemonLog } from "../sessions/daemon/appendDaemonLog";
import { sendToDaemonAwaitAck } from "../sessions/daemon/sendToDaemonAwaitAck";

const USAGE_EVENTS = new Set(["PostToolUse", "Stop"]);

export async function relayCodexUsage(
	event: string,
	transcriptPath: string | undefined,
): Promise<void> {
	const sessionId = process.env.ASSIST_SESSION_ID;
	if (!sessionId || !transcriptPath || !USAGE_EVENTS.has(event)) return;
	try {
		await sendToDaemonAwaitAck({
			type: "codex-usage",
			sessionId,
			transcriptPath,
			ack: true,
		});
	} catch (error) {
		appendDaemonLog(
			`codex-usage relay failed: id=${sessionId}: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
}
