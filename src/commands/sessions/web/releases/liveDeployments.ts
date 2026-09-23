import {
	type CommitNode,
	type DeploymentNode,
	deploymentMaps,
	type LiveDeployment,
	releaseCommit,
} from "./deploymentMaps";
import { deploymentsAlias, deploymentsQuery } from "./deploymentsQuery";
import { ghJson } from "./ghJson";
import type { ReleaseCommit } from "./types";

export type RepoDeployments = {
	defaultBranch: string | null;
	head: ReleaseCommit | null;
	live: Map<string, LiveDeployment>;
	queued: Map<string, LiveDeployment>;
};

type DeploymentConnection = { nodes?: (DeploymentNode | null)[] } | null;

type RepositoryDeployments = {
	defaultBranchRef?: { name: string; target?: CommitNode | null } | null;
} & Record<string, unknown>;

type DeploymentsResponse = {
	data?: { repository?: RepositoryDeployments | null };
};

function headCommit(node: CommitNode | null | undefined): ReleaseCommit | null {
	return node?.oid ? releaseCommit(node.oid, node) : null;
}

function environmentNodes(
	repository: RepositoryDeployments,
	count: number,
): (DeploymentNode | null)[] {
	return Array.from(
		{ length: count },
		(_, index) =>
			(repository[deploymentsAlias(index)] as DeploymentConnection)?.nodes ??
			[],
	).flat();
}

export async function liveDeployments(
	cwd: string,
	repo: string,
	environments: string[],
): Promise<RepoDeployments> {
	const [owner, name] = repo.split("/");
	if (!owner || !name) throw new Error(`Not an owner/name repo: ${repo}`);
	const distinct = [...new Set(environments)];
	const response = await ghJson<DeploymentsResponse>(cwd, [
		"api",
		"graphql",
		"-f",
		`query=${deploymentsQuery(distinct)}`,
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
		...deploymentMaps(environmentNodes(repository, distinct.length)),
	};
}
