import Box from "@mui/material/Box";
import { useMemo, useRef } from "react";
import type { ReleaseStreamState } from "../../../../releases/types";
import { ReleaseEdges } from "./ReleaseGraph/ReleaseEdges";
import { releaseEdgePromotions } from "./ReleaseGraph/releaseEdgePromotions";
import { releaseGraphColumns } from "./ReleaseGraph/releaseGraphColumns";
import { ReleaseGraphColumn } from "./ReleaseGraph/ReleaseGraphColumn";
import type { ReleaseLayer } from "../releaseLayerLabels";
import { useReleaseEdgePaths } from "./ReleaseGraph/useReleaseEdgePaths";

const scrollerSx = { overflowX: "auto", p: 1.5, flex: "1 1 auto", minWidth: 0 };

const graphSx = {
	position: "relative",
	display: "grid",
	gridAutoFlow: "column",
	gridAutoColumns: "minmax(180px, 1fr)",
	gap: 4,
	minWidth: "min-content",
} as const;

export function ReleaseGraph({
	stream,
	layer,
	highlight,
}: {
	stream: ReleaseStreamState;
	layer: ReleaseLayer;
	highlight: Set<string> | null;
}) {
	const graphRef = useRef<HTMLDivElement>(null);
	const { nodes, edges } = stream;
	const columns = useMemo(
		() => releaseGraphColumns(nodes, edges),
		[nodes, edges],
	);
	const promoted = useMemo(
		() => releaseEdgePromotions(nodes, edges, layer),
		[nodes, edges, layer],
	);
	const geometry = useReleaseEdgePaths(graphRef, edges);

	return (
		<Box sx={scrollerSx}>
			<Box ref={graphRef} sx={graphSx}>
				<ReleaseEdges edges={edges} promoted={promoted} geometry={geometry} />
				{columns.map((column, index) => (
					<ReleaseGraphColumn
						key={column[0]?.id ?? `column-${index}`}
						nodes={column}
						stream={stream}
						layer={layer}
						highlight={highlight}
					/>
				))}
			</Box>
		</Box>
	);
}
