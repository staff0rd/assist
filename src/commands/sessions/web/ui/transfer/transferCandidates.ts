import { transferPlan } from "../../../shared/transferPlan";
import type { NodesState, SessionInfo } from "../types";
import { otherConnectedNodes } from "./otherConnectedNodes";

export function transferCandidates(
	session: SessionInfo,
	nodes: NodesState | null,
): string[] {
	return transferPlan(session) ? otherConnectedNodes(session, nodes) : [];
}
