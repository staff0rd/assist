import type { SessionClient } from "../broadcast";
import { createLinkContext } from "./createLinkContext";
import { describeLink } from "./describeLink";
import { forwardToLink } from "./forwardToLink";
import type { LinkContext, NodeLinkDeps } from "./LinkContext";
import { LinkHealer } from "./LinkHealer";
import { replayLinkScrollback } from "./LinkRelayState";
import type { LinkSpec } from "./LinkStatus";
import { openLink } from "./openLink";
import { requestLinkHistory } from "./requestLinkHistory";
import { disconnectLink } from "./teardownLink";

export class NodeLink {
	private readonly ctx: LinkContext;

	constructor(
		readonly spec: LinkSpec,
		deps: NodeLinkDeps,
	) {
		const ctx = createLinkContext(spec, deps);
		const healer = new LinkHealer(ctx);
		ctx.connect = () => void openLink(ctx);
		ctx.onMismatch = (version) => void healer.onMismatch(version);
		ctx.onCompatible = () => healer.onCompatible();
		this.ctx = ctx;
	}

	start = () => this.ctx.connect();
	sessions = () => this.ctx.relay.sessions;
	status = () => describeLink(this.ctx);
	history = () => requestLinkHistory(this.ctx);

	route(client: SessionClient, data: Record<string, unknown>): void {
		forwardToLink(this.ctx, client, data);
	}

	replayScrollback(client: SessionClient): void {
		replayLinkScrollback(this.ctx.relay, client);
	}

	dispose(): void {
		this.ctx.disposed = true;
		clearTimeout(this.ctx.reconnectTimer);
		disconnectLink(this.ctx);
		this.ctx.tunnel?.dispose();
	}
}
