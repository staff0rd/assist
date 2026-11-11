import type { LinkStatus } from "../../../../../../daemon/links/LinkStatus";
import { formatRelativeTime } from "../../../../formatRelativeTime";
import type { NodeUpdateEntry } from "../../NodeUpdateEntry";
import { updateState } from "../nodeUpdates/updateState";
import type { UpdateStateKind } from "../nodeUpdates/UpdateStateKind";
import { protocolDirection } from "./protocolDirection";

export type StatusKind =
	| UpdateStateKind
	| "disconnected"
	| "connecting"
	| "blocked";

type StatusAction = "restart" | "fix" | "web";

export type NodeStatus = {
	kind: StatusKind;
	label: string;
	line: string;
	action?: StatusAction;
	attention?: "warning" | "error";
};

function linkStatus(link: LinkStatus): NodeStatus | undefined {
	if (link.state === "disconnected")
		return {
			kind: "disconnected",
			label: "Disconnected",
			line: link.errorAt
				? `since ${formatRelativeTime(link.errorAt)} · update state unknown`
				: "update state unknown",
			attention: "error",
		};
	if (link.state === "connecting")
		return {
			kind: "connecting",
			label: "Connecting…",
			line: "waiting for the link",
		};
	if (link.state === "version-blocked")
		return {
			kind: "blocked",
			label: "Link blocked",
			line: `${protocolDirection(link)} link protocol · update it`,
			attention: "warning",
		};
	return undefined;
}

function updateStatus(entry: NodeUpdateEntry): NodeStatus {
	const state = updateState(entry);
	if (state.kind === "ready")
		return { ...state, action: "restart", attention: "warning" };
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
): NodeStatus {
	const problem = link && linkStatus(link);
	if (problem) return problem;
	if (!entry)
		return { kind: "loading", label: "Checking", line: "waiting for node" };
	return updateStatus(entry);
}

export function needsAttention(status: NodeStatus): boolean {
	return status.attention !== undefined || status.action !== undefined;
}
