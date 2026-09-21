import LaunchIcon from "@mui/icons-material/Launch";
import { Box, Link, Tooltip, Typography } from "@mui/material";
import type { HighLevelTreeFile } from "../../../review/highLevel/types";
import { HighLevelLineCounts } from "./HighLevelLineCounts";
import {
	HIGH_LEVEL_STATUS_COLOURS,
	HIGH_LEVEL_STATUS_LETTERS,
	highLevelTreeNameSx,
	highLevelTreeRowSx,
} from "./highLevelTreeRowSx";

export function HighLevelTreeFileRow({
	file,
	indent,
}: {
	file: HighLevelTreeFile;
	indent: string;
}) {
	return (
		<Box sx={{ ...highLevelTreeRowSx, pl: indent }}>
			<Tooltip title={file.status}>
				<Typography
					component="span"
					sx={{ ...highLevelTreeNameSx, flexShrink: 0, fontWeight: 700 }}
					color={HIGH_LEVEL_STATUS_COLOURS[file.status]}
				>
					{HIGH_LEVEL_STATUS_LETTERS[file.status]}
				</Typography>
			</Tooltip>
			<Typography component="span" sx={highLevelTreeNameSx} title={file.path}>
				{file.name}
			</Typography>
			<Link
				href={file.diffUrl}
				target="_blank"
				rel="noreferrer"
				aria-label={`Open ${file.path} on GitHub`}
				sx={{ display: "flex", flexShrink: 0, color: "text.secondary" }}
			>
				<LaunchIcon sx={{ fontSize: 13 }} />
			</Link>
			<HighLevelLineCounts
				additions={file.additions}
				deletions={file.deletions}
			/>
		</Box>
	);
}
