import type { ActiveWindow } from "../../../shared/activeWindows";
import type { HarnessKind } from "../../../shared/harnesses";
import type { RateLimits } from "../../../shared/RateLimits";
import { broadcast, type SessionClient, sendTo } from "./broadcast";
import { recentDaemonLogLines } from "./daemonLog";
import { ObservedLimits } from "./ObservedLimits";
import { UserActivity } from "./UserActivity";

// why: re-exported as ClientHub's companion persister so the daemon wires both from one import, keeping SessionManager under the maintainability gate.
export { persistUsagePeak } from "./persistUsagePeak";

// The set of connected web clients plus the single latest rate-limit value we
// replay to each newcomer. Extends Set so existing broadcast call sites keep
// passing it directly.
export class ClientHub extends Set<SessionClient> {
	private readonly limits = new ObservedLimits();
	// why: log delivery is opt-in so browser tabs aren't spammed; only connections that ask via subscribe-logs receive daemonLog lines.
	private readonly logSubscribers = new Set<SessionClient>();
	private readonly peers = new Map<SessionClient, string | undefined>();
	private readonly webServers = new Set<SessionClient>();
	readonly userActivity = new UserActivity();

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
		this.updateHarnessLimits(undefined, rateLimits);
	}

	updateHarnessLimits(
		harness: HarnessKind | undefined,
		rateLimits: RateLimits,
	): void {
		const observation = this.limits.observe(harness, rateLimits);
		if (!observation) return;
		broadcast(this, observation.message);
		if (observation.harness)
			this.persistPeak?.(rateLimits, observation.harness);
		else this.persistPeak?.(rateLimits);
	}

	currentWindows(harness?: HarnessKind): ActiveWindow[] {
		return this.limits.windows(harness);
	}

	greet(client: SessionClient): void {
		for (const message of this.limits.greetings()) sendTo(client, message);
	}

	markPeer(client: SessionClient, node?: string): void {
		this.peers.set(client, node);
	}

	isPeer(client: SessionClient): boolean {
		return this.peers.has(client);
	}

	peerFor(node: string): SessionClient | undefined {
		let latest: SessionClient | undefined;
		for (const [client, name] of this.peers) if (name === node) latest = client;
		return latest;
	}

	viewers(): Set<SessionClient> {
		return new Set([...this].filter((client) => !this.peers.has(client)));
	}

	subscribeLogs(client: SessionClient, replay = true, webServer = false): void {
		if (webServer) this.webServers.add(client);
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
		this.webServers.delete(client);
		this.peers.delete(client);
	}

	restartWebServers(): number {
		broadcast(this.webServers, { type: "restart-webserver" });
		return this.webServers.size;
	}

	// why: bound so it can be handed to setDaemonLogSink as a bare reference.
	emitLog = (line: string, relayed = false): void => {
		for (const client of this.logSubscribers) {
			if (relayed && this.isPeer(client)) continue;
			sendTo(client, { type: "log", line });
		}
	};
}
