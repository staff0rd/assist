import { Box, Typography } from "@mui/material";
import type { HighLevelStructure } from "../../../../../../../review/highLevel/types";
import { HighLevelLineCounts } from "../HighLevelLineCounts";
import { HighLevelStructureSummary } from "../HighLevelStructureView/HighLevelStructureSummary";

export function HighLevelOverviewHeader({
	structure,
	sliceCount,
}: {
	structure: HighLevelStructure;
	sliceCount: number;
}) {
	return (
		<Box
			sx={{
				display: "grid",
				gridTemplateColumns: "minmax(0, 1fr) auto",
				columnGap: 1.25,
				alignItems: "baseline",
			}}
		>
			<Typography component="h3" variant="subtitle2">
				Overview
			</Typography>
			<HighLevelLineCounts
				additions={structure.additions}
				deletions={structure.deletions}
				inline
			/>
			<Typography
				variant="body2"
				sx={{ gridColumn: "1 / 3", color: "text.secondary" }}
			>
				{sliceCount} {sliceCount === 1 ? "slice" : "slices"} ·{" "}
				<HighLevelStructureSummary structure={structure} />
			</Typography>
		</Box>
	);
}
