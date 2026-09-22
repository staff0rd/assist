import type { ReleaseNodeState } from "../releases/types";
import { ReleaseLiveLine } from "./ReleaseLiveLine";
import { ReleaseQueuedLine } from "./ReleaseQueuedLine";

export function ReleaseNodeFacts({
	node,
	repo,
	defaultBranch,
}: {
	node: ReleaseNodeState;
	repo: string;
	defaultBranch: string | null;
}) {
	if (node.kind !== "environment") return null;

	return (
		<>
			<ReleaseLiveLine node={node} repo={repo} defaultBranch={defaultBranch} />
			{node.queued && (
				<ReleaseQueuedLine
					repo={repo}
					environment={node.environment}
					commit={node.queued}
				/>
			)}
		</>
	);
}
