import type { ReleaseNode } from "../../../../shared/types";
import { commitsBehind } from "./commitsBehind";
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

export async function declaredNodeState(
	cwd: string,
	repo: string,
	defaultBranch: string | null,
	node: ReleaseNode,
	deployments: RepoDeployments,
	run: ReleaseRunNodeState | null,
): Promise<ReleaseNodeState> {
	const environment = node.environment ?? null;
	const deployment = environment
		? deployments.live.get(environment)
		: undefined;
	const queued = environment ? deployments.queued.get(environment) : undefined;
	const behind =
		deployment && defaultBranch
			? await commitsBehind(cwd, repo, defaultBranch, deployment.commit.sha)
			: null;
	return {
		id: node.id,
		kind: kindOf(node),
		environment,
		label: node.label ?? node.id,
		live: deployment?.commit ?? null,
		deployedAt: deployment?.at ?? null,
		behind,
		queued: queued?.commit ?? null,
		run,
	};
}
