import { Box } from "@mui/material";
import type { HighLevelSliceSplit } from "../../../../../../../../review/highLevel/types";

export function HighLevelTreeSplitChip({
	split,
}: {
	split: HighLevelSliceSplit;
}) {
	return (
		<Box
			component="span"
			title="The rest of this file's hunks are in other slices"
			sx={{
				fontSize: 11,
				fontWeight: 500,
				lineHeight: "18px",
				color: "text.secondary",
				bgcolor: "action.selected",
				borderRadius: 1,
				px: 0.75,
				flexShrink: 0,
				whiteSpace: "nowrap",
			}}
		>
			{split.hunks} of {split.of} hunks
		</Box>
	);
}
