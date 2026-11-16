import { resolveNodeName } from "../../shared/resolveNodeName";
import { daemonLog } from "../daemonLog";
import { broadcastToViewers, type LinkRelayState } from "./LinkRelayState";
import { splitNodeSessionId, toNodeSessionId } from "./splitNodeSessionId";

type Msg = Record<string, unknown>;

function localSessionId(id: unknown, localNode: string): unknown {
	if (typeof id !== "string") return id;
	const split = splitNodeSessionId(id);
	return split?.node === localNode ? split.id : id;
}

export function relayNotice(
	state: LinkRelayState,
	msg: Msg,
	localNode: string = resolveNodeName(),
): void {
	const transfer = msg.transfer as Msg | undefined;
	if (transfer)
		daemonLog(
			`link ${state.node} ws: transfer notice ${String(transfer.sourceId)} -> ${String(transfer.sessionId)} on ${String(transfer.node)}`,
		);
	broadcastToViewers(
		state,
		typeof transfer?.sourceId === "string"
			? {
					...msg,
					transfer: {
						...transfer,
						sourceId: toNodeSessionId(state.node, transfer.sourceId),
						sessionId: localSessionId(transfer.sessionId, localNode),
					},
				}
			: msg,
	);
}
