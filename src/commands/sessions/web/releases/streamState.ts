import type { ReleaseStream } from "../../../../shared/types";
import { environmentState } from "./environmentState";
import { liveDeployments } from "./liveDeployments";
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
	};
	const nodes = stream.nodes.filter((node) => node.environment);
	try {
		const { defaultBranch, live } = await liveDeployments(
			cwd,
			stream.repo,
			nodes.map((node) => node.environment ?? node.id),
		);
		const environments = await Promise.all(
			nodes.map((node) =>
				environmentState(cwd, stream.repo, defaultBranch, node, live),
			),
		);
		return { ...declared, defaultBranch, environments };
	} catch (error) {
		return {
			...declared,
			defaultBranch: null,
			environments: [],
			error: errorMessage(error),
		};
	}
}
