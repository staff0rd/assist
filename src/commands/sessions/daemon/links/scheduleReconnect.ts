import type { LinkContext } from "./LinkContext";

function armReconnect(ctx: LinkContext, delay: number): void {
	clearTimeout(ctx.reconnectTimer);
	ctx.reconnectTimer = setTimeout(ctx.connect, delay);
	ctx.reconnectTimer.unref?.();
}

export function scheduleReconnect(ctx: LinkContext): void {
	if (ctx.disposed || ctx.blockedMessage) return;
	const delay = ctx.breaker.tripped()
		? ctx.breaker.remainingMs()
		: ctx.deps.reconnectMs;
	armReconnect(ctx, delay);
}

export function reconnectNow(ctx: LinkContext): void {
	ctx.breaker.clear();
	armReconnect(ctx, ctx.deps.reconnectMs);
}
