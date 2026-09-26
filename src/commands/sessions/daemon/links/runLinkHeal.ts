import { ASSIST_VERSION } from "../buildHello";
import { daemonLog } from "../daemonLog";
import type { LinkContext } from "./LinkContext";
import { broadcastToViewers, failPendingCreators } from "./LinkRelayState";
import { reconnectNow } from "./scheduleReconnect";
import { disconnectLink } from "./teardownLink";

export async function runLinkHeal(
	ctx: LinkContext,
	peerVersion: string,
): Promise<void> {
	const node = ctx.spec.name;
	daemonLog(
		`link ${node} heal: peer ${peerVersion} is older than ${ASSIST_VERSION}; requesting self-update`,
	);
	failPendingCreators(
		ctx.relay,
		`${node} is out of date; updating it now — retry once the update finishes.`,
	);
	disconnectLink(ctx);
	try {
		await ctx.deps.heal(ctx.spec.url);
		daemonLog(`link ${node} heal: self-update done, reconnecting`);
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		daemonLog(`link ${node} heal: self-update failed: ${message}`);
		broadcastToViewers(ctx.relay, {
			type: "error",
			message: `${node} auto-update failed: ${message}`,
		});
	}
	reconnectNow(ctx);
}
