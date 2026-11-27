import type { RateLimits } from "../shared/RateLimits";
import { sendToDaemon } from "./sessions/daemon/sendToDaemon";

const RELAY_TIMEOUT_MS = 1_000;

// why: the status line must print regardless of daemon state, so every failure
// path here is swallowed and the relay is bounded by a short timeout
export async function relayRateLimits(rateLimits?: RateLimits): Promise<void> {
	if (!rateLimits) return;
	try {
		await sendToDaemon({ type: "limits", rateLimits }, RELAY_TIMEOUT_MS);
	} catch {
		// daemon not running — relay is best-effort
	}
}
