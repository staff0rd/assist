import type { LinkStatus } from "../../../../../../daemon/links/LinkStatus";
import type { NodeUpdateEntry } from "../../NodeUpdateEntry";
import { updateState } from "../nodeUpdates/updateState";
import type { UpdateStateKind } from "../nodeUpdates/UpdateStateKind";
import { linkStatus } from "./linkStatus";

export type StatusKind =
	| UpdateStateKind
	| "disconnected"
	| "connecting"
	| "blocked"
	| "restarting";

type StatusAction = "restart" | "fix" | "web";

export type NodeStatus = {
	kind: StatusKind;
	label: string;
	line: string;
	action?: StatusAction;
	attention?: "warning" | "error";
};

function updateStatus(entry: NodeUpdateEntry): NodeStatus {
	const state = updateState(entry);
	if (state.kind === "ready") return { ...state, action: "restart" };
	if (state.kind === "failing")
		return { ...state, action: "web", attention: "error" };
	if (state.kind === "diverged")
		return {
			...state,
			action: entry.status?.loop.escalationId ? "fix" : undefined,
			attention: "error",
		};
	return state;
}

export function nodeStatus(
	link: LinkStatus | undefined,
	entry: NodeUpdateEntry | undefined,
	restarting = false,
): NodeStatus {
	if (restarting)
		return {
			kind: "restarting",
			label: "Restarting…",
			line: `waiting for ${link?.name ?? entry?.name ?? "the node"} to come back`,
		};
	const problem = link && linkStatus(link);
	if (problem) return problem;
	if (!entry)
		return { kind: "loading", label: "Checking", line: "waiting for node" };
	return updateStatus(entry);
}

export function needsAttention(status: NodeStatus): boolean {
	return status.attention !== undefined;
}
