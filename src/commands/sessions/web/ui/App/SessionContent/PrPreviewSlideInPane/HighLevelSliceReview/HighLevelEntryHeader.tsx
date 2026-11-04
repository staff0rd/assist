import { Box } from "@mui/material";
import type { HighLevelStructure } from "../../../../../../../review/highLevel/types";
import { HighLevelOverviewHeader } from "./HighLevelOverviewHeader";
import type { HighLevelReviewEntry } from "./highLevelReviewEntries";
import { HighLevelSliceHeader } from "./HighLevelSliceHeader";

export function HighLevelEntryHeader({
	entry,
	structure,
	sliceCount,
}: {
	entry: HighLevelReviewEntry;
	structure: HighLevelStructure;
	sliceCount: number;
}) {
	return (
		<Box sx={{ px: 2.5, pt: 1.75 }}>
			{entry.view ? (
				<HighLevelSliceHeader
					number={entry.view.number}
					slice={entry.view.slice}
				/>
			) : (
				<HighLevelOverviewHeader
					structure={structure}
					sliceCount={sliceCount}
				/>
			)}
		</Box>
	);
}
