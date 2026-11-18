import { transferBlockedReason } from "../../../shared/transferBlockedReason";
import type { NodesState, SessionInfo } from "../types";
import { otherConnectedNodes } from "./otherConnectedNodes";

export function blockedTransferReason(
	session: SessionInfo,
	nodes: NodesState | null,
): string | undefined {
	if (otherConnectedNodes(session, nodes).length === 0) return undefined;
	return transferBlockedReason(session);
}
