import { sendTo } from "../broadcast";
import { daemonLog } from "../daemonLog";
import type { LinkRelayState } from "./LinkRelayState";

type Msg = Record<string, unknown>;

export function relayReply(state: LinkRelayState, msg: Msg): void {
	const id = typeof msg.requestId === "string" ? msg.requestId : undefined;
	const client = id ? state.pendingReplies.get(id) : state.lastRequester;
	if (id) state.pendingReplies.delete(id);
	daemonLog(
		`link ${state.node} ws: ${msg.type} reply${id ? ` ${id}` : ""}${client ? "" : " with no requester"}`,
	);
	if (client) sendTo(client, msg);
}
