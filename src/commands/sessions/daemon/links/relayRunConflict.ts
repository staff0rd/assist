import { sendTo } from "../broadcast";
import {
	broadcastToViewers,
	type LinkRelayState,
	takePendingCreator,
} from "./LinkRelayState";
import { toNodeSessionId } from "./splitNodeSessionId";

export function relayRunConflict(
	state: LinkRelayState,
	msg: Record<string, unknown>,
): void {
	const ns = (id: unknown) =>
		typeof id === "string" ? toNodeSessionId(state.node, id) : id;
	const existing = msg.existing as { id?: string } | undefined;
	const namespaced = {
		...msg,
		sessionId: ns(msg.sessionId),
		existing: existing && { ...existing, id: ns(existing.id) },
		node: state.node,
	};
	const client = takePendingCreator(state) ?? state.lastRequester;
	if (client) sendTo(client, namespaced);
	else broadcastToViewers(state, namespaced);
}
