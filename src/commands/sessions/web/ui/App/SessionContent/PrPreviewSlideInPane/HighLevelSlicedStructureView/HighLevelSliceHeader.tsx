import { Box, Typography } from "@mui/material";
import type { HighLevelSlice } from "../../../../../../../review/highLevel/types";
import { HighLevelLineCounts } from "../HighLevelLineCounts";

export function HighLevelSliceHeader({
	number,
	slice,
}: {
	number: number;
	slice: HighLevelSlice;
}) {
	return (
		<Box
			sx={{
				display: "grid",
				gridTemplateColumns: "auto minmax(0, 1fr) auto",
				columnGap: 1.25,
				alignItems: "baseline",
			}}
		>
			<Typography
				component="span"
				variant="caption"
				sx={{
					fontFamily: "fontFamilyMono",
					fontWeight: 600,
					color: "text.secondary",
				}}
			>
				{number}
			</Typography>
			<Typography component="h3" variant="subtitle2">
				{slice.title}
			</Typography>
			<HighLevelLineCounts
				additions={slice.additions}
				deletions={slice.deletions}
				inline
			/>
			{slice.summary && (
				<Typography
					variant="body2"
					sx={{ gridColumn: "2 / 4", color: "text.secondary" }}
				>
					{slice.summary}
				</Typography>
			)}
		</Box>
	);
}
