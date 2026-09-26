import { acceptPeerHello } from "./acceptPeerHello";
import type { LinkContext } from "./LinkContext";
import { relayLinkMessage } from "./relayLinkMessage";
import { setLinkState } from "./setLinkState";
import { disconnectLink, failLink } from "./teardownLink";

function onHello(ctx: LinkContext, msg: Record<string, unknown>): void {
	const verdict = acceptPeerHello(ctx.spec.name, msg);
	if (verdict.peer) ctx.peer = verdict.peer;
	if (verdict.kind === "reject") {
		disconnectLink(ctx);
		return failLink(ctx, verdict.reason);
	}
	if (verdict.kind === "heal") return ctx.onMismatch(verdict.peer.version);
	ctx.greeted = true;
	ctx.breaker.clear();
	ctx.lastError = undefined;
	setLinkState(ctx, "connected");
	ctx.onCompatible();
}

export function onLinkLine(ctx: LinkContext, line: string): void {
	let msg: Record<string, unknown>;
	try {
		msg = JSON.parse(line);
	} catch {
		return;
	}
	if (msg.type === "hello") return onHello(ctx, msg);
	if (ctx.greeted) relayLinkMessage(ctx.relay, msg);
}
