import { ghJson } from "./ghJson";

export type LiveDeployment = { sha: string; at: string };

type RepoDeployments = {
	defaultBranch: string | null;
	live: Map<string, LiveDeployment>;
};

type DeploymentNode = {
	environment: string | null;
	createdAt: string;
	commitOid: string | null;
	latestStatus: { state: string; createdAt: string } | null;
};

type DeploymentsResponse = {
	data?: {
		repository?: {
			defaultBranchRef?: { name: string } | null;
			deployments?: { nodes?: (DeploymentNode | null)[] };
		} | null;
	};
};

const DEPLOYMENT_PAGE = 100;

function query(environments: string[]): string {
	return `query($owner:String!,$name:String!){
  repository(owner:$owner,name:$name){
    defaultBranchRef{ name }
    deployments(environments:${JSON.stringify(environments)}, last:${DEPLOYMENT_PAGE}, orderBy:{field:CREATED_AT,direction:ASC}){
      nodes{ environment createdAt commitOid latestStatus{ state createdAt } }
    }
  }
}`;
}

function newestSuccessful(
	nodes: (DeploymentNode | null)[],
): Map<string, LiveDeployment> {
	const live = new Map<string, LiveDeployment>();
	for (const node of nodes) {
		if (!node?.environment || !node.commitOid) continue;
		if (node.latestStatus?.state !== "SUCCESS") continue;
		live.set(node.environment, {
			sha: node.commitOid,
			at: node.latestStatus.createdAt ?? node.createdAt,
		});
	}
	return live;
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
		`query=${query(environments)}`,
		"-f",
		`owner=${owner}`,
		"-f",
		`name=${name}`,
	]);
	const repository = response.data?.repository;
	if (!repository) throw new Error(`Repository not readable: ${repo}`);
	return {
		defaultBranch: repository.defaultBranchRef?.name ?? null,
		live: newestSuccessful(repository.deployments?.nodes ?? []),
	};
}
