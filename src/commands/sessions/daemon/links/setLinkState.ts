import { daemonLog } from "../daemonLog";
import type { LinkContext } from "./LinkContext";
import type { LinkState } from "./LinkStatus";

export function setLinkState(ctx: LinkContext, next: LinkState): void {
	if (ctx.state === next) return;
	daemonLog(`link ${ctx.spec.name} ws: state ${ctx.state} -> ${next}`);
	ctx.state = next;
	ctx.deps.onStateChanged();
}

export function sendToLink(ctx: LinkContext, msg: object): boolean {
	return ctx.socket?.send(JSON.stringify(msg)) ?? false;
}
