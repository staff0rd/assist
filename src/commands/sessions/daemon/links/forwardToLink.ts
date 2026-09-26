import type { SessionClient } from "../broadcast";
import { daemonLog } from "../daemonLog";
import { unavailableReason } from "./describeLink";
import { forwardLinkCreate } from "./forwardLinkCreate";
import { isLinkCreate } from "./isLinkCreate";
import type { LinkContext } from "./LinkContext";
import { sendToLink } from "./setLinkState";
import { toPeerMessage } from "./toPeerMessage";

type Msg = Record<string, unknown>;

export function forwardToLink(
	ctx: LinkContext,
	client: SessionClient,
	data: Msg,
): void {
	ctx.relay.lastRequester = client;
	if (isLinkCreate(data.type)) return forwardLinkCreate(ctx, client, data);
	const node = ctx.spec.name;
	const delivered = ctx.greeted && sendToLink(ctx, toPeerMessage(data));
	if (!delivered)
		daemonLog(
			`link ${node} ws: DROPPED ${data.type} for ${data.sessionId} (${unavailableReason(ctx)})`,
		);
	else if (data.type !== "input")
		daemonLog(`link ${node} ws: forwarded ${data.type} for ${data.sessionId}`);
}
