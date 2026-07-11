import { sendToDaemon } from "./sessions/daemon/sendToDaemon";

export async function relayUsage(
	claudeSessionId: string | undefined,
	transcriptPath: string | undefined,
	usedPct: number | undefined,
): Promise<void> {
	if (!claudeSessionId) return;
	try {
		await sendToDaemon({
			type: "usage",
			claudeSessionId,
			transcriptPath,
			usedPct,
		});
	} catch {
		// daemon not running — relay is best-effort
	}
}
