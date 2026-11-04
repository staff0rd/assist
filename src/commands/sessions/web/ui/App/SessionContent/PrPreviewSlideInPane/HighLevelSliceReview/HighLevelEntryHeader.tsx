import { Box, Typography } from "@mui/material";
import type { HighLevelReviewEntry } from "./highLevelReviewEntries";
import { HighLevelSliceHeader } from "./HighLevelSliceHeader";

export function HighLevelEntryHeader({
	entry,
}: {
	entry: HighLevelReviewEntry;
}) {
	return (
		<Box sx={{ px: 2.5, pt: 1.75 }}>
			{entry.view ? (
				<HighLevelSliceHeader
					number={entry.view.number}
					slice={entry.view.slice}
				/>
			) : (
				<>
					<Typography component="h3" variant="subtitle2">
						Overview
					</Typography>
					<Typography variant="body2" sx={{ color: "text.secondary" }}>
						Checks run for you, how to exercise the PR by hand, and every
						changed file.
					</Typography>
				</>
			)}
		</Box>
	);
}
