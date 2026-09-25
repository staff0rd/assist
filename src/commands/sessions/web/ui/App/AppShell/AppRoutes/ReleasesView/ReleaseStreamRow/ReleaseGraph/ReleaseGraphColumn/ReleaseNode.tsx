import Box from "@mui/material/Box";
import type { ReleaseNodeState } from "../../../../../../../../releases/types";
import type { ReleaseLayer } from "../../../releaseLayerLabels";
import { ReleaseNodeFacts } from "./ReleaseNode/ReleaseNodeFacts";
import { ReleaseNodeHeader } from "./ReleaseNode/ReleaseNodeHeader";
import { releaseNodeState } from "./ReleaseNode/releaseNodeState";
import { releaseNodeSx } from "./ReleaseNode/releaseNodeSx";
import { ReleaseRunFacts } from "./ReleaseNode/ReleaseRunFacts";
import { releaseRunState } from "./ReleaseNode/releaseRunState";

export function ReleaseNode({
	node,
	repo,
	defaultBranch,
	layer,
	dimmed,
	ringed,
}: {
	node: ReleaseNodeState;
	repo: string;
	defaultBranch: string | null;
	layer: ReleaseLayer;
	dimmed: boolean;
	ringed: boolean;
}) {
	const runMark = layer === "run" ? releaseRunState(node, Date.now()) : null;
	const mark = runMark ?? releaseNodeState(node, defaultBranch);

	return (
		<Box
			data-release-node={node.id}
			sx={releaseNodeSx(node.kind, mark.tone, dimmed, ringed)}
		>
			<ReleaseNodeHeader label={node.label} mark={mark} />
			{runMark ? (
				<ReleaseRunFacts node={node} mark={runMark} />
			) : (
				<ReleaseNodeFacts
					node={node}
					repo={repo}
					defaultBranch={defaultBranch}
				/>
			)}
		</Box>
	);
}
