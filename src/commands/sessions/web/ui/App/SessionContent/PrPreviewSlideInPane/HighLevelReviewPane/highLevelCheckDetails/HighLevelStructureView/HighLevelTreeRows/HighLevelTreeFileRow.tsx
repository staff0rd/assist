import { Box, Tooltip, Typography } from "@mui/material";
import type { HighLevelTreeFile } from "../../../../../../../../../../review/highLevel/types";
import { HighLevelLineCounts } from "../../HighLevelLineCounts";
import {
	HIGH_LEVEL_STATUS_COLOURS,
	HIGH_LEVEL_STATUS_LETTERS,
	highLevelButtonResetSx,
	highLevelTreeNameSx,
	highLevelTreeRowSx,
} from "../../highLevelTreeRowSx";

export function HighLevelTreeFileRow({
	file,
	indent,
	onOpen,
}: {
	file: HighLevelTreeFile;
	indent: string;
	onOpen: () => void;
}) {
	return (
		<Box
			component="button"
			type="button"
			onClick={onOpen}
			aria-label={`Show the diff of ${file.path}`}
			sx={{
				...highLevelTreeRowSx,
				pl: indent,
				...highLevelButtonResetSx,
			}}
		>
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
			<HighLevelLineCounts
				additions={file.additions}
				deletions={file.deletions}
			/>
		</Box>
	);
}
