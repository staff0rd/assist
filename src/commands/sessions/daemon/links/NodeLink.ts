import type { SessionClient } from "../broadcast";
import { daemonLog } from "../daemonLog";
import { createLinkContext } from "./createLinkContext";
import { describeLink } from "./describeLink";
import { forwardToLink } from "./forwardToLink";
import type { LinkContext, NodeLinkDeps } from "./LinkContext";
import { replayLinkScrollback } from "./LinkRelayState";
import type { LinkSpec } from "./LinkStatus";
import { openLink } from "./openLink";
import { requestLinkHistory } from "./requestLinkHistory";
import { reconnectNow } from "./scheduleReconnect";
import { sendToLink, setLinkState } from "./setLinkState";
import { disconnectLink } from "./teardownLink";

export class NodeLink {
	private readonly ctx: LinkContext;

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
