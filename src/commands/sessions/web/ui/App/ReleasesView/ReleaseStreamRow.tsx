import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { useCallback, useMemo, useState } from "react";
import type { ReleaseStreamState } from "../../../releases/types";
import { ReleaseGraph } from "./ReleaseStreamRow/ReleaseGraph";
import type { ReleaseLayer } from "./releaseLayerLabels";
import { ReleaseStreamRail } from "./ReleaseStreamRow/ReleaseStreamRail";
import { releaseSummaryPills } from "./ReleaseStreamRow/releaseSummaryPills";

const streamSx = {
	display: "flex",
	alignItems: "stretch",
	flexDirection: { xs: "column", md: "row" },
} as const;

const noticeSx = { flex: "1 1 auto", minWidth: 0, p: 1.5 } as const;

export function ReleaseStreamRow({
	stream,
	layer,
}: {
	stream: ReleaseStreamState;
	layer: ReleaseLayer;
}) {
	const [highlight, setHighlight] = useState<Set<string> | null>(null);
	const pills = useMemo(
		() => releaseSummaryPills(stream, layer),
		[stream, layer],
	);
	const onHighlight = useCallback(
		(ids: string[] | null) => setHighlight(ids ? new Set(ids) : null),
		[],
	);

	return (
		<Paper variant="outlined" sx={streamSx}>
			<ReleaseStreamRail
				stream={stream}
				pills={pills}
				onHighlight={onHighlight}
			/>
			{stream.error ? (
				<Box sx={noticeSx}>
					<Alert severity="warning" variant="outlined">
						{stream.error}
					</Alert>
				</Box>
			) : stream.nodes.length === 0 ? (
				<Box sx={noticeSx}>
					<Typography variant="body2" color="text.secondary">
						No nodes declared for this stream.
					</Typography>
				</Box>
			) : (
				<ReleaseGraph stream={stream} layer={layer} highlight={highlight} />
			)}
		</Paper>
	);
}
