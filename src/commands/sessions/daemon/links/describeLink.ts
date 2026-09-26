import type { LinkContext } from "./LinkContext";
import type { LinkStatus } from "./LinkStatus";

export function describeLink(ctx: LinkContext): LinkStatus {
	return {
		name: ctx.spec.name,
		url: ctx.spec.url,
		state: ctx.state,
		error: ctx.blockedMessage ?? ctx.lastError?.message,
		errorAt: ctx.lastError?.at,
		peerVersion: ctx.peer?.version,
		peerProtocol: ctx.peer?.protocol,
	};
}

export function unavailableReason(ctx: LinkContext): string {
	if (ctx.blockedMessage) return ctx.blockedMessage;
	const detail = ctx.lastError ? `: ${ctx.lastError.message}` : "";
	return `${ctx.spec.name} is ${ctx.state}${detail}`;
}
