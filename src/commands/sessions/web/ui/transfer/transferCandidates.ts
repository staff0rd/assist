import { backlogRunArgs } from "../../../shared/backlogRunArgs";
import type { NodesState, SessionInfo } from "../types";

export function transferCandidates(
	session: SessionInfo,
	nodes: NodesState | null,
): string[] {
	if (!nodes || !backlogRunArgs(session) || !session.repoGroup) return [];
	const current = session.node ?? nodes.local;
	const connected = nodes.links
		.filter((link) => link.state === "connected")
		.map((link) => link.name);
	return [nodes.local, ...connected].filter((node) => node !== current);
}
