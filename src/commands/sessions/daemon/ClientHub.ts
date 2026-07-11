import {
	type ActiveWindow,
	activeWindows,
} from "../../../shared/activeWindows";
import type { RateLimits } from "../../../shared/RateLimits";
import { broadcast, type SessionClient, sendTo } from "./broadcast";
import { recentDaemonLogLines } from "./daemonLog";

// why: re-exported as ClientHub's companion persister so the daemon wires both from one import, keeping SessionManager under the maintainability gate.
export { persistUsagePeak } from "./persistUsagePeak";

// The set of connected web clients plus the single latest rate-limit value we
// replay to each newcomer. Extends Set so existing broadcast call sites keep
// passing it directly.
export class ClientHub extends Set<SessionClient> {
	private latestLimits: RateLimits | undefined;
	// why: log delivery is opt-in so browser tabs aren't spammed; only connections that ask via subscribe-logs receive daemonLog lines.
	private readonly logSubscribers = new Set<SessionClient>();

	// why: the daemon injects a best-effort persister; left undefined elsewhere so `new ClientHub()` works and broadcasting never depends on it.
	constructor(private readonly persistPeak?: (rateLimits: RateLimits) => void) {
		super();
	}

	updateLimits(rateLimits: RateLimits): void {
		this.latestLimits = rateLimits;
		broadcast(this, { type: "limits", rateLimits });
		this.persistPeak?.(rateLimits);
	}

	currentWindows(): ActiveWindow[] {
		return activeWindows(this.latestLimits);
	}

	greet(client: SessionClient): void {
		if (this.latestLimits) {
			sendTo(client, { type: "limits", rateLimits: this.latestLimits });
		}
	}

	subscribeLogs(client: SessionClient, replay = true): void {
		// why: replay buffered history before registering, so a line emitted mid-replay isn't sent twice.
		if (replay) {
			for (const line of recentDaemonLogLines()) {
				sendTo(client, { type: "log", line });
			}
		}
		this.logSubscribers.add(client);
	}

	unsubscribeLogs(client: SessionClient): void {
		this.logSubscribers.delete(client);
	}

	// why: bound so it can be handed to setDaemonLogSink as a bare reference.
	emitLog = (line: string): void => {
		for (const client of this.logSubscribers) {
			sendTo(client, { type: "log", line });
		}
	};
}
