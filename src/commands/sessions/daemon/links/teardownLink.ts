import { daemonLog } from "../daemonLog";
import type { LinkContext } from "./LinkContext";
import { broadcastToViewers, resetRelayState } from "./LinkRelayState";
import { scheduleReconnect } from "./scheduleReconnect";
import { setLinkState } from "./setLinkState";

export function teardownLink(ctx: LinkContext): void {
	const hadSessions = ctx.relay.sessions.length > 0;
	ctx.socket = null;
	ctx.greeted = false;
	ctx.protocol = undefined;
	resetRelayState(ctx.relay, `${ctx.spec.name} connection closed`);
	if (!ctx.blockedMessage) setLinkState(ctx, "disconnected");
	if (hadSessions) ctx.deps.onSessionsChanged();
}

export function disconnectLink(ctx: LinkContext): void {
	const socket = ctx.socket;
	teardownLink(ctx);
	socket?.close();
}

export function failLink(ctx: LinkContext, message: string): void {
	daemonLog(`link ${ctx.spec.name} ws: ${message}`);
	ctx.lastError = { message, at: new Date().toISOString() };
	ctx.breaker.fail(message);
	setLinkState(ctx, ctx.blockedMessage ? "version-blocked" : "disconnected");
	scheduleReconnect(ctx);
}

export function blockLink(ctx: LinkContext, message: string): void {
	const repeat = ctx.blockedMessage === message;
	if (!repeat) daemonLog(`link ${ctx.spec.name} ws: ${message}`);
	ctx.blockedMessage = message;
	disconnectLink(ctx);
	setLinkState(ctx, "version-blocked");
	if (!repeat) broadcastToViewers(ctx.relay, { type: "error", message });
	scheduleReconnect(ctx);
}
