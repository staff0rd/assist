import { Box, Button, Typography } from "@mui/material";
import type { HighLevelTreeFile } from "../../../../../../../../../../review/highLevel/types";

export function HighLevelDiffDialogNav({
	files,
	file,
	onSelect,
}: {
	files: HighLevelTreeFile[];
	file: HighLevelTreeFile;
	onSelect: (file: HighLevelTreeFile) => void;
}) {
	const index = files.findIndex((candidate) => candidate.path === file.path);
	const previous = files[index - 1];
	const next = index === -1 ? undefined : files[index + 1];

	return (
		<Box sx={{ display: "flex", alignItems: "center", gap: 1, mr: "auto" }}>
			<Button
				disabled={!previous}
				onClick={() => previous && onSelect(previous)}
			>
				Previous
			</Button>
			<Typography variant="caption" sx={{ color: "text.secondary" }}>
				{index + 1} / {files.length}
			</Typography>
			<Button disabled={!next} onClick={() => next && onSelect(next)}>
				Next
			</Button>
		</Box>
	);
}
