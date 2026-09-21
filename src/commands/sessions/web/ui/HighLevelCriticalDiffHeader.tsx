import { Box, Link, Typography } from "@mui/material";
import type { HighLevelCriticalDiff } from "../../../review/highLevel/types";
import { HighLevelLineCounts } from "./HighLevelLineCounts";
import {
	HIGH_LEVEL_STATUS_COLOURS,
	highLevelTreeNameSx,
} from "./highLevelTreeRowSx";

export function HighLevelCriticalDiffHeader({
	diff,
}: {
	diff: HighLevelCriticalDiff;
}) {
	return (
		<Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
			<Link
				href={diff.diffUrl}
				target="_blank"
				rel="noreferrer"
				sx={{ ...highLevelTreeNameSx, fontWeight: 600 }}
				title={diff.path}
			>
				{diff.path}
			</Link>
			<Typography
				variant="caption"
				sx={{ flexShrink: 0 }}
				color={HIGH_LEVEL_STATUS_COLOURS[diff.status]}
			>
				{diff.status}
			</Typography>
			<HighLevelLineCounts
				additions={diff.additions}
				deletions={diff.deletions}
			/>
		</Box>
	);
}
