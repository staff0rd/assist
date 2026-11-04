import { Box, Link, Typography } from "@mui/material";
import type { HighLevelCriticalDiff } from "../../../../../../review/highLevel/types";
import { highLevelDiffHeaderSx } from "./HighLevelCriticalDiffHeader/highLevelDiffHeaderSx";
import { HighLevelDiffChevron } from "./HighLevelCriticalDiffHeader/HighLevelDiffChevron";
import { useStuckHeaderToggle } from "./useStuckHeaderToggle";
import { HighLevelLineCounts } from "./HighLevelLineCounts";
import {
	HIGH_LEVEL_STATUS_COLOURS,
	highLevelTreeNameSx,
} from "./highLevelTreeRowSx";

export function HighLevelCriticalDiffHeader({
	diff,
	collapsed,
	onToggle,
}: {
	diff: Pick<
		HighLevelCriticalDiff,
		"path" | "status" | "additions" | "deletions" | "diffUrl"
	>;
	collapsed: boolean;
	onToggle: () => void;
}) {
	const { ref, toggle } = useStuckHeaderToggle(!collapsed, onToggle);
	return (
		<Box ref={ref} onClick={toggle} sx={highLevelDiffHeaderSx}>
			<HighLevelDiffChevron
				path={diff.path}
				collapsed={collapsed}
				onToggle={toggle}
			/>
			<Link
				href={diff.diffUrl}
				target="_blank"
				rel="noreferrer"
				onClick={(event) => event.stopPropagation()}
				sx={{ ...highLevelTreeNameSx, fontWeight: 600 }}
				title={diff.path}
			>
				{diff.path}
			</Link>
			<Typography
				variant="caption"
				sx={{ flexShrink: 0, color: HIGH_LEVEL_STATUS_COLOURS[diff.status] }}
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
