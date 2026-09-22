import type { ReleaseStream } from "../../../../shared/types";
import { declaredNodeState } from "./declaredNodeState";
import { liveDeployments } from "./liveDeployments";
import { streamRunState } from "./streamRunState";
import type { ReleaseStreamState } from "./types";

function errorMessage(error: unknown): string {
	if (!(error instanceof Error)) return "Failed to read release state";
	return error.message.trim().split("\n")[0] || "Failed to read release state";
}

export async function streamState(
	cwd: string,
	stream: ReleaseStream,
): Promise<ReleaseStreamState> {
	const declared = {
		name: stream.name,
		repo: stream.repo,
		workflow: stream.workflow,
		edges: stream.edges,
	};
	try {
		const [deployments, { run, byNode }] = await Promise.all([
			liveDeployments(
				cwd,
				stream.repo,
				stream.nodes.flatMap((node) =>
					node.environment ? [node.environment] : [],
				),
			),
			streamRunState(cwd, stream),
		]);
		const nodes = await Promise.all(
			stream.nodes.map((node) =>
				declaredNodeState(
					cwd,
					stream.repo,
					deployments.defaultBranch,
					node,
					deployments,
					byNode.get(node.id) ?? null,
				),
			),
		);
		return {
			...declared,
			defaultBranch: deployments.defaultBranch,
			head: deployments.head,
			nodes,
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
