import Box from "@mui/material/Box";
import type { ReleaseNodeState, ReleaseStreamState } from "../releases/types";
import type { ReleaseLayer } from "./releaseLayerLabels";
import { ReleaseNode } from "./ReleaseNode";

const columnSx = {
	display: "flex",
	flexDirection: "column",
	justifyContent: "center",
	gap: 1,
} as const;

export function ReleaseGraphColumn({
	nodes,
	stream,
	layer,
	highlight,
}: {
	nodes: ReleaseNodeState[];
	stream: ReleaseStreamState;
	layer: ReleaseLayer;
	highlight: Set<string> | null;
}) {
	return (
		<Box sx={columnSx}>
			{nodes.map((node) => (
				<ReleaseNode
					key={node.id}
					node={node}
					repo={stream.repo}
					defaultBranch={stream.defaultBranch}
					layer={layer}
					dimmed={Boolean(highlight) && !highlight?.has(node.id)}
					ringed={Boolean(highlight?.has(node.id))}
				/>
			))}
		</Box>
	);
}
