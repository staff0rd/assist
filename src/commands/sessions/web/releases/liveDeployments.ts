import {
	type CommitNode,
	type DeploymentNode,
	deploymentMaps,
	type LiveDeployment,
	releaseCommit,
} from "./deploymentMaps";
import { deploymentsQuery } from "./deploymentsQuery";
import { ghJson } from "./ghJson";
import type { ReleaseCommit } from "./types";

export type RepoDeployments = {
	defaultBranch: string | null;
	head: ReleaseCommit | null;
	live: Map<string, LiveDeployment>;
	queued: Map<string, LiveDeployment>;
};

type DeploymentsResponse = {
	data?: {
		repository?: {
			defaultBranchRef?: { name: string; target?: CommitNode | null } | null;
			deployments?: { nodes?: (DeploymentNode | null)[] };
		} | null;
	};
};

function headCommit(node: CommitNode | null | undefined): ReleaseCommit | null {
	return node?.oid ? releaseCommit(node.oid, node) : null;
}

export async function liveDeployments(
	cwd: string,
	repo: string,
	environments: string[],
): Promise<RepoDeployments> {
	const [owner, name] = repo.split("/");
	if (!owner || !name) throw new Error(`Not an owner/name repo: ${repo}`);
	const response = await ghJson<DeploymentsResponse>(cwd, [
		"api",
		"graphql",
		"-f",
		`query=${deploymentsQuery(environments)}`,
		"-f",
		`owner=${owner}`,
		"-f",
		`name=${name}`,
	]);
	const repository = response.data?.repository;
	if (!repository) throw new Error(`Repository not readable: ${repo}`);
	return {
		defaultBranch: repository.defaultBranchRef?.name ?? null,
		head: headCommit(repository.defaultBranchRef?.target),
		...deploymentMaps(repository.deployments?.nodes ?? []),
	};
}
