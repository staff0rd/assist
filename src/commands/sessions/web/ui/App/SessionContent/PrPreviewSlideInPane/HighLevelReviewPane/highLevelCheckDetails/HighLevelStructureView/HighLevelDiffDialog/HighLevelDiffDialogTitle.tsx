import LaunchIcon from "@mui/icons-material/Launch";
import { Box, DialogTitle, IconButton } from "@mui/material";
import type { ViewType } from "react-diff-view";
import type { HighLevelTreeFile } from "../../../../../../../../../../review/highLevel/types";
import { DiffViewTypeToggle } from "../../../../../../DiffViewTypeToggle";
import { HighLevelLineCounts } from "../../HighLevelLineCounts";

const pathSx = {
	fontFamily: "monospace",
	fontSize: "0.95rem",
	overflow: "hidden",
	textOverflow: "ellipsis",
	whiteSpace: "nowrap",
} as const;

export function HighLevelDiffDialogTitle({
	file,
	viewType,
	onChangeViewType,
}: {
	file: HighLevelTreeFile;
	viewType: ViewType;
	onChangeViewType: (viewType: ViewType) => void;
}) {
	return (
		<DialogTitle
			sx={{ display: "flex", alignItems: "center", gap: 1, py: 1.5 }}
		>
			<Box component="span" sx={pathSx}>
				{file.path}
			</Box>
			<HighLevelLineCounts
				additions={file.additions}
				deletions={file.deletions}
			/>
			<DiffViewTypeToggle viewType={viewType} onChange={onChangeViewType} />
			<IconButton
				size="small"
				href={file.diffUrl}
				target="_blank"
				rel="noreferrer"
				aria-label={`Open ${file.path} on GitHub`}
			>
				<LaunchIcon sx={{ fontSize: 16 }} />
			</IconButton>
		</DialogTitle>
	);
}
