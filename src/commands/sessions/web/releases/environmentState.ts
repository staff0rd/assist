import type { ReleaseNode } from "../../../../shared/types";
import { commitsBehind } from "./commitsBehind";
import type { LiveDeployment } from "./liveDeployments";
import type { ReleaseEnvironmentState } from "./types";

export async function environmentState(
	cwd: string,
	repo: string,
	defaultBranch: string | null,
	node: ReleaseNode,
	live: Map<string, LiveDeployment>,
): Promise<ReleaseEnvironmentState> {
	const environment = node.environment ?? node.id;
	const deployment = live.get(environment);
	const behind =
		deployment && defaultBranch
			? await commitsBehind(cwd, repo, defaultBranch, deployment.sha)
			: null;
	return {
		id: node.id,
		environment,
		label: node.label ?? node.id,
		sha: deployment?.sha ?? null,
		deployedAt: deployment?.at ?? null,
		behind,
	};
}
