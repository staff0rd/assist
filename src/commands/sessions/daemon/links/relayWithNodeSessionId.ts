import { broadcastToViewers, type LinkRelayState } from "./LinkRelayState";
import { toNodeSessionId } from "./splitNodeSessionId";

export function relayWithNodeSessionId(
	state: LinkRelayState,
	msg: Record<string, unknown>,
): void {
	broadcastToViewers(state, {
		...msg,
		sessionId: toNodeSessionId(state.node, msg.sessionId as string),
	});
}
