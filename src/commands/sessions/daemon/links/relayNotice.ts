import { broadcastToViewers, type LinkRelayState } from "./LinkRelayState";
import { toNodeSessionId } from "./splitNodeSessionId";

type Msg = Record<string, unknown>;

export function relayNotice(state: LinkRelayState, msg: Msg): void {
	const transfer = msg.transfer as Msg | undefined;
	broadcastToViewers(
		state,
		typeof transfer?.sourceId === "string"
			? {
					...msg,
					transfer: {
						...transfer,
						sourceId: toNodeSessionId(state.node, transfer.sourceId),
					},
				}
			: msg,
	);
}
