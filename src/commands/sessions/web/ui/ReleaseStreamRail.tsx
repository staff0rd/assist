import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { ReleaseStreamState } from "../releases/types";
import type { ReleasePill } from "./releasePill";
import { ReleaseStreamLinks } from "./ReleaseStreamLinks";
import { ReleaseStreamPills } from "./ReleaseStreamPills";

const railSx = {
	flex: { md: "0 0 252px" },
	borderRight: { xs: 0, md: 1 },
	borderBottom: { xs: 1, md: 0 },
	borderColor: "divider",
	px: 1.5,
	py: 1,
} as const;

const nameSx = { fontSize: "1.05rem" } as const;

const metaSx = {
	fontFamily: "monospace",
	display: "block",
	fontSize: 13.2,
	color: "text.secondary",
};

export function ReleaseStreamRail({
	stream,
	pills,
	onHighlight,
}: {
	stream: ReleaseStreamState;
	pills: ReleasePill[];
	onHighlight: (ids: string[] | null) => void;
}) {
	return (
		<Box sx={railSx}>
			<Typography variant="subtitle2" sx={nameSx}>
				{stream.name}
			</Typography>
			<Box sx={metaSx}>{stream.repo}</Box>
			<Box sx={metaSx}>{stream.workflow}</Box>
			<ReleaseStreamLinks stream={stream} sx={metaSx} />
			<ReleaseStreamPills pills={pills} onHighlight={onHighlight} />
		</Box>
	);
}
