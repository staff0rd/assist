import { sendToDaemon } from "./sessions/daemon/sendToDaemon";

const RELAY_TIMEOUT_MS = 1_000;

export async function relayUsage(
	claudeSessionId: string | undefined,
	transcriptPath: string | undefined,
	usedPct: number | undefined,
): Promise<void> {
	if (!claudeSessionId) return;
	try {
		await sendToDaemon(
			{ type: "usage", claudeSessionId, transcriptPath, usedPct },
			RELAY_TIMEOUT_MS,
		);
	} catch {
		// daemon not running — relay is best-effort
	}
}
