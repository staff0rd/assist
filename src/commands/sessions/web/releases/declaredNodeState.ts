import type { ReleaseNode } from "../../../../shared/types";
import type { RepoDeployments } from "./liveDeployments";
import type {
	ReleaseNodeKind,
	ReleaseNodeState,
	ReleaseRunNodeState,
} from "./types";

function kindOf(node: ReleaseNode): ReleaseNodeKind {
	if (node.environment) return "environment";
	return node.kind === "gate" ? "gate" : "build";
}

export function declaredNodeState(
	node: ReleaseNode,
	deployments: RepoDeployments,
	behindBySha: Map<string, number | null>,
	run: ReleaseRunNodeState | null,
): ReleaseNodeState {
	const environment = node.environment ?? null;
	const deployment = environment
		? deployments.live.get(environment)
		: undefined;
	const queued = environment ? deployments.queued.get(environment) : undefined;
	return {
		id: node.id,
		kind: kindOf(node),
		environment,
		label: node.label ?? node.id,
		live: deployment?.commit ?? null,
		deployedAt: deployment?.at ?? null,
		behind: deployment
			? (behindBySha.get(deployment.commit.sha) ?? null)
			: null,
		queued: queued?.commit ?? null,
		run,
	};
}
