import { buildHello } from "../buildHello";
import { daemonLog } from "../daemonLog";
import type { LinkContext } from "./LinkContext";
import type { LinkSocket } from "./LinkTransport";
import { onLinkLine } from "./onLinkLine";
import { scheduleReconnect } from "./scheduleReconnect";
import { sendToLink, setLinkState } from "./setLinkState";
import { failLink, teardownLink } from "./teardownLink";

function onLinkClose(ctx: LinkContext, socket: LinkSocket, reason: string) {
	if (ctx.socket !== socket) return;
	daemonLog(`link ${ctx.spec.name} ws: closed (${reason})`);
	teardownLink(ctx);
	scheduleReconnect(ctx);
}

export async function openLink(ctx: LinkContext): Promise<void> {
	if (ctx.disposed || ctx.blockedMessage || ctx.socket) return;
	if (ctx.breaker.tripped()) return scheduleReconnect(ctx);
	setLinkState(ctx, "connecting");
	try {
		await ctx.tunnel?.ready();
		if (ctx.disposed) return;
		daemonLog(`link ${ctx.spec.name} ws: connecting to ${ctx.spec.url}`);
		const socket: LinkSocket = await ctx.deps.transport(ctx.spec.url, {
			onLine: (line) => onLinkLine(ctx, line),
			onClose: (reason) => onLinkClose(ctx, socket, reason),
		});
		if (ctx.disposed) return socket.close();
		ctx.socket = socket;
		daemonLog(`link ${ctx.spec.name} ws: open, sending hello`);
		sendToLink(ctx, buildHello({ peer: true }));
		sendToLink(ctx, { type: "subscribe-logs" });
	} catch (error) {
		failLink(ctx, error instanceof Error ? error.message : String(error));
	}
}
