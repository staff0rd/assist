import type { SessionClient } from "../broadcast";
import { daemonLog } from "../daemonLog";
import { createLinkContext } from "./createLinkContext";
import { describeLink, unavailableReason } from "./describeLink";
import { forwardToLink } from "./forwardToLink";
import type { LinkContext, NodeLinkDeps } from "./LinkContext";
import { replayLinkScrollback } from "./LinkRelayState";
import type { LinkSpec } from "./LinkStatus";
import { openLink } from "./openLink";
import { requestLinkHistory } from "./requestLinkHistory";
import { reconnectNow } from "./scheduleReconnect";
import { sendToLink, setLinkState } from "./setLinkState";
import { disconnectLink } from "./teardownLink";

const ACTIVITY_LOG_GAP_MS = 60_000;

export class NodeLink {
	private readonly ctx: LinkContext;
	private lastActivityRelayAt = Number.NEGATIVE_INFINITY;

	constructor(
		readonly spec: LinkSpec,
		deps: NodeLinkDeps,
	) {
		const ctx = createLinkContext(spec, deps);
		ctx.connect = () => void openLink(ctx);
		this.ctx = ctx;
	}

	start = () => this.ctx.connect();

	unlatch(): void {
		if (!this.ctx.blockedMessage) return;
		daemonLog(`link ${this.spec.name} ws: protocol block cleared by reload`);
		this.ctx.blockedMessage = undefined;
		setLinkState(this.ctx, "disconnected");
		reconnectNow(this.ctx);
	}

	sessions = () => this.ctx.relay.sessions;
	status = () => describeLink(this.ctx);
	history = () => requestLinkHistory(this.ctx);

	route(client: SessionClient, data: Record<string, unknown>): void {
		forwardToLink(this.ctx, client, data);
	}

	relayUserActivity(now = Date.now()): void {
		const delivered =
			this.ctx.greeted && sendToLink(this.ctx, { type: "user-activity" });
		if (now - this.lastActivityRelayAt > ACTIVITY_LOG_GAP_MS)
			daemonLog(
				`link ${this.spec.name} ws: ${delivered ? "relayed" : `DROPPED (${unavailableReason(this.ctx)})`} user-activity`,
			);
		this.lastActivityRelayAt = now;
	}

	viewerLeft(viewerId: string): void {
		if (!this.ctx.greeted) return;
		if (sendToLink(this.ctx, { type: "viewer-left", viewerId }))
			daemonLog(`link ${this.spec.name} ws: viewer ${viewerId} left`);
	}

	replayScrollback(client: SessionClient): void {
		replayLinkScrollback(this.ctx.relay, client);
	}

	dispose(): void {
		this.ctx.disposed = true;
		clearTimeout(this.ctx.reconnectTimer);
		disconnectLink(this.ctx);
	}
}
