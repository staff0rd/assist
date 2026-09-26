import {
	type ActiveWindow,
	activeWindows,
} from "../../../shared/activeWindows";
import type { HarnessKind } from "../../../shared/harnesses";
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
	private readonly harnessLimits = new Map<HarnessKind, RateLimits>();
	// why: log delivery is opt-in so browser tabs aren't spammed; only connections that ask via subscribe-logs receive daemonLog lines.
	private readonly logSubscribers = new Set<SessionClient>();
	private readonly peers = new Set<SessionClient>();

	// why: the daemon injects a best-effort persister; left undefined elsewhere so `new ClientHub()` works and broadcasting never depends on it.
	constructor(
		private readonly persistPeak?: (
			rateLimits: RateLimits,
			harness?: HarnessKind,
		) => void,
	) {
		super();
	}

	updateLimits(rateLimits: RateLimits): void {
		this.latestLimits = rateLimits;
		broadcast(this, { type: "limits", rateLimits });
		this.persistPeak?.(rateLimits);
	}

	updateHarnessLimits(harness: HarnessKind, rateLimits: RateLimits): void {
		if (harness === "claude") {
			this.updateLimits(rateLimits);
			return;
		}
		this.harnessLimits.set(harness, rateLimits);
		broadcast(this, { type: "limits", harness, rateLimits });
		this.persistPeak?.(rateLimits, harness);
	}

	currentWindows(harness?: HarnessKind): ActiveWindow[] {
		if (!harness || harness === "claude")
			return activeWindows(this.latestLimits);
		return activeWindows(this.harnessLimits.get(harness), harness);
	}

	greet(client: SessionClient): void {
		if (this.latestLimits) {
			sendTo(client, { type: "limits", rateLimits: this.latestLimits });
		}
		for (const [harness, rateLimits] of this.harnessLimits)
			sendTo(client, { type: "limits", harness, rateLimits });
	}

	markPeer(client: SessionClient): void {
		this.peers.add(client);
	}

	isPeer(client: SessionClient): boolean {
		return this.peers.has(client);
	}

	viewers(): Set<SessionClient> {
		return new Set([...this].filter((client) => !this.peers.has(client)));
	}

	subscribeLogs(client: SessionClient, replay = true): void {
		// why: replay buffered history before registering, so a line emitted mid-replay isn't sent twice.
		if (replay) {
			for (const line of recentDaemonLogLines(!this.isPeer(client))) {
				sendTo(client, { type: "log", line });
			}
		}
		this.logSubscribers.add(client);
	}

	unsubscribeLogs(client: SessionClient): void {
		this.logSubscribers.delete(client);
		this.peers.delete(client);
	}

	// why: bound so it can be handed to setDaemonLogSink as a bare reference.
	emitLog = (line: string, relayed = false): void => {
		for (const client of this.logSubscribers) {
			if (relayed && this.isPeer(client)) continue;
			sendTo(client, { type: "log", line });
		}
	};
}
