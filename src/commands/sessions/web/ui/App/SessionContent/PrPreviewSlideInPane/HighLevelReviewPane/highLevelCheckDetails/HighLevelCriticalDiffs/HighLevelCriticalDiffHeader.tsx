import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Box, IconButton, Link, Typography } from "@mui/material";
import type { HighLevelCriticalDiff } from "../../../../../../../../../review/highLevel/types";
import { HighLevelLineCounts } from "../HighLevelLineCounts";
import {
	HIGH_LEVEL_STATUS_COLOURS,
	highLevelTreeNameSx,
} from "../highLevelTreeRowSx";

export function HighLevelCriticalDiffHeader({
	diff,
	collapsed,
	onToggle,
}: {
	diff: HighLevelCriticalDiff;
	collapsed: boolean;
	onToggle: () => void;
}) {
	const Chevron = collapsed ? ChevronRightIcon : ExpandMoreIcon;
	return (
		<Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
			<IconButton
				size="small"
				onClick={onToggle}
				aria-expanded={!collapsed}
				aria-label={`${collapsed ? "Expand" : "Collapse"} ${diff.path}`}
				sx={{ p: 0.25, flexShrink: 0 }}
			>
				<Chevron sx={{ fontSize: 16 }} />
			</IconButton>
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
