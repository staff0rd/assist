import { Box, Typography } from "@mui/material";
import { HighLevelTestsGroupingToggle } from "./HighLevelTestsGroupingToggle";
import type { HighLevelTestsGrouping } from "./useHighLevelTestsGrouping";

export function HighLevelTestsToolbar({
	summary,
	grouping,
	onGrouping,
}: {
	summary: string | undefined;
	grouping: HighLevelTestsGrouping | undefined;
	onGrouping: (grouping: HighLevelTestsGrouping) => void;
}) {
	if (summary === undefined && grouping === undefined) return null;
	return (
		<Box
			sx={{
				display: "flex",
				flexWrap: "wrap",
				alignItems: "center",
				gap: 1,
				mb: 0.5,
			}}
		>
			{summary !== undefined && (
				<Typography
					variant="caption"
					component="div"
					sx={{ color: "text.secondary" }}
				>
					{summary}
				</Typography>
			)}
			{grouping !== undefined && (
				<HighLevelTestsGroupingToggle
					grouping={grouping}
					onChange={onGrouping}
				/>
			)}
		</Box>
	);
}
