import { sendTo } from "../broadcast";
import { daemonLog } from "../daemonLog";
import { broadcastToViewers, type LinkRelayState } from "./LinkRelayState";
import { toNodeSessionId } from "./splitNodeSessionId";
import { takePendingCreator } from "./takePendingCreator";

type Msg = Record<string, unknown>;

export function relayToCreator(label: string) {
	return (state: LinkRelayState, msg: Msg): void => {
		daemonLog(
			`link ${state.node} ws: ${label} ${msg.sessionId ?? msg.message}`,
		);
		const client = takePendingCreator(state, msg.traceId);
		const reply =
			msg.type === "created"
				? {
						...msg,
						sessionId: toNodeSessionId(state.node, msg.sessionId as string),
					}
				: msg;
		if (client) sendTo(client, reply);
		else if (msg.type === "error") broadcastToViewers(state, reply);
		else
			daemonLog(`link ${state.node} ws: ${msg.type} with no pending creator`);
	};
}
