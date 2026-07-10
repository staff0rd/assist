import { sendToDaemon } from "./sessions/daemon/sendToDaemon";

// why: like relayRateLimits, the status line must print regardless of daemon
// state, so every failure path here is swallowed and the relay is bounded by a
// short timeout. Carries the Claude session id so the daemon can join the spend
// to whichever backlog phase that conversation is running.
export async function relayUsage(
	claudeSessionId: string | undefined,
	totalIn: number,
	totalOut: number,
	usedPct: number | undefined,
): Promise<void> {
	if (!claudeSessionId) return;
	try {
		await sendToDaemon({
			type: "usage",
			claudeSessionId,
			totalIn,
			totalOut,
			usedPct,
		});
	} catch {
		// daemon not running — relay is best-effort
	}
}
