import type { ReleaseStream } from "../../../../shared/types";
import { behindBySha } from "./behindBySha";
import { declaredNodeState } from "./declaredNodeState";
import { liveDeployments } from "./liveDeployments";
import { streamEnvironments } from "./streamEnvironments";
import { streamRunState } from "./streamRunState";
import type { ReleaseStreamState } from "./types";

function errorMessage(error: unknown): string {
	if (!(error instanceof Error)) return "Failed to read release state";
	return error.message.trim().split("\n")[0] || "Failed to read release state";
}

export async function streamState(
	cwd: string,
	stream: ReleaseStream,
	repoEnvironments: string[] = streamEnvironments(stream),
): Promise<ReleaseStreamState> {
	const declared = {
		name: stream.name,
		repo: stream.repo,
		workflow: stream.workflow,
		edges: stream.edges,
	};
	try {
		const [deployments, { run, byNode }] = await Promise.all([
			liveDeployments(cwd, stream.repo, repoEnvironments),
			streamRunState(cwd, stream),
		]);
		const behind = await behindBySha(cwd, stream.repo, deployments);
		return {
			...declared,
			defaultBranch: deployments.defaultBranch,
			head: deployments.head,
			nodes: stream.nodes.map((node) =>
				declaredNodeState(
					node,
					deployments,
					behind,
					byNode.get(node.id) ?? null,
				),
			),
			run,
		};
	} catch (error) {
		return {
			...declared,
			defaultBranch: null,
			head: null,
			nodes: [],
			run: null,
			error: errorMessage(error),
		};
	}
}
