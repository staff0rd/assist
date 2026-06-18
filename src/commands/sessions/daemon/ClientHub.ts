import type { RateLimits } from "../../../shared/RateLimits";
import { broadcast, type SessionClient, sendTo } from "./broadcast";

// why: re-exported as ClientHub's companion persister so the daemon wires both from one import, keeping SessionManager under the maintainability gate.
export { persistUsagePeak } from "./persistUsagePeak";

// The set of connected web clients plus the single latest rate-limit value we
// replay to each newcomer. Extends Set so existing broadcast call sites keep
// passing it directly.
export class ClientHub extends Set<SessionClient> {
	private latestLimits: RateLimits | undefined;

	// why: the daemon injects a best-effort persister; left undefined elsewhere so `new ClientHub()` works and broadcasting never depends on it.
	constructor(private readonly persistPeak?: (rateLimits: RateLimits) => void) {
		super();
	}

	updateLimits(rateLimits: RateLimits): void {
		this.latestLimits = rateLimits;
		broadcast(this, { type: "limits", rateLimits });
		this.persistPeak?.(rateLimits);
	}

	greet(client: SessionClient): void {
		if (this.latestLimits) {
			sendTo(client, { type: "limits", rateLimits: this.latestLimits });
		}
	}
}
