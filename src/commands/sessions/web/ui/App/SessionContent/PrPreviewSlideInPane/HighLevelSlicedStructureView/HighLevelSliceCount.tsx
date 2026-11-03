import { Typography } from "@mui/material";
import type { HighLevelStructure } from "../../../../../../../review/highLevel/types";
import { HighLevelStructureSummary } from "../HighLevelStructureView/HighLevelStructureSummary";

export function HighLevelSliceCount({
	count,
	structure,
}: {
	count: number;
	structure: HighLevelStructure;
}) {
	return (
		<Typography variant="caption" sx={{ color: "text.secondary" }}>
			{count} {count === 1 ? "slice" : "slices"} ·{" "}
			<HighLevelStructureSummary structure={structure} />
		</Typography>
	);
}
