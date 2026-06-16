import type { RateLimits } from "../shared/RateLimits";
import { connectToDaemon } from "./sessions/daemon/connectToDaemon";

// why: the status line must print regardless of daemon state, so every failure
// path here is swallowed and the relay is bounded by a short timeout
export async function relayRateLimits(rateLimits?: RateLimits): Promise<void> {
	if (!rateLimits) return;
	try {
		const socket = await connectToDaemon();
		const timer = setTimeout(() => socket.destroy(), 500);
		socket.on("error", () => {});
		socket.write(`${JSON.stringify({ type: "limits", rateLimits })}\n`, () => {
			clearTimeout(timer);
			socket.end();
		});
	} catch {
		// daemon not running — relay is best-effort
	}
}
