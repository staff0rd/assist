import type { RateLimits } from "../../../shared/RateLimits";
import { broadcast, type SessionClient, sendTo } from "./broadcast";

// The set of connected web clients plus the single latest rate-limit value we
// replay to each newcomer. Extends Set so existing broadcast call sites keep
// passing it directly.
export class ClientHub extends Set<SessionClient> {
	private latestLimits: RateLimits | undefined;

	updateLimits(rateLimits: RateLimits): void {
		this.latestLimits = rateLimits;
		broadcast(this, { type: "limits", rateLimits });
	}

	greet(client: SessionClient): void {
		if (this.latestLimits) {
			sendTo(client, { type: "limits", rateLimits: this.latestLimits });
		}
	}
}
