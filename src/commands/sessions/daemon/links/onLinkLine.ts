import { daemonLog } from "../daemonLog";
import { acceptPeerHello } from "./acceptPeerHello";
import type { LinkContext } from "./LinkContext";
import { relayLinkMessage } from "./relayLinkMessage";
import { setLinkState } from "./setLinkState";
import { blockLink, disconnectLink, failLink } from "./teardownLink";

function onHello(ctx: LinkContext, msg: Record<string, unknown>): void {
	const verdict = acceptPeerHello(ctx.spec.name, msg);
	const previousVersion = ctx.peer?.version;
	if (verdict.peer) ctx.peer = verdict.peer;
	if (verdict.peer && verdict.peer.version !== previousVersion)
		ctx.deps.onStateChanged();
	if (verdict.kind === "reject") {
		disconnectLink(ctx);
		return failLink(ctx, verdict.reason);
	}
	if (verdict.kind === "block") return blockLink(ctx, verdict.reason);
	if (ctx.blockedMessage)
		daemonLog(
			`link ${ctx.spec.name} ws: peer now reports ${verdict.peer.version}; protocol block cleared`,
		);
	ctx.blockedMessage = undefined;
	ctx.protocol = verdict.protocol;
	ctx.greeted = true;
	ctx.breaker.clear();
	ctx.lastError = undefined;
	setLinkState(ctx, "connected");
	ctx.deps.onHistoryChanged();
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
