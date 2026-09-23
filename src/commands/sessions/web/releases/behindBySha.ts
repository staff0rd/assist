import { commitsBehind } from "./commitsBehind";
import type { RepoDeployments } from "./liveDeployments";

export async function behindBySha(
	cwd: string,
	repo: string,
	deployments: RepoDeployments,
): Promise<Map<string, number | null>> {
	if (!deployments.defaultBranch) return new Map();
	return commitsBehind(
		cwd,
		repo,
		deployments.defaultBranch,
		liveShas(deployments),
	);
}

function liveShas(deployments: RepoDeployments): string[] {
	return [
		...new Set([...deployments.live.values()].map((d) => d.commit.sha)),
	].sort();
}
