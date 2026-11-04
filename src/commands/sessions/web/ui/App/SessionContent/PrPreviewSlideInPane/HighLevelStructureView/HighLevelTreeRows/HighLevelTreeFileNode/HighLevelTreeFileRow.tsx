import { Box } from "@mui/material";
import { useStuckHeaderToggle } from "../../../useStuckHeaderToggle";
import type { HighLevelTreeFile } from "../../../../../../../../../review/highLevel/types";
import { HighLevelLineCounts } from "../../../HighLevelLineCounts";
import {
	highLevelTreeFileButtonSx,
	highLevelTreeFileRowSx,
} from "./HighLevelTreeFileRow/highLevelTreeFileRowSx";
import { HighLevelTreeFileLink } from "./HighLevelTreeFileRow/HighLevelTreeFileLink";
import { HighLevelTreeFileChevron } from "./HighLevelTreeFileRow/HighLevelTreeFileChevron";
import { HighLevelTreeFileLabel } from "./HighLevelTreeFileRow/HighLevelTreeFileLabel";
import { HighLevelTreeFileTags } from "./HighLevelTreeFileRow/HighLevelTreeFileTags";
import { HighLevelTreeSliceTags } from "./HighLevelTreeFileRow/HighLevelTreeSliceTags";

export function HighLevelTreeFileRow({
	file,
	indent,
	open,
	onToggle,
	glob,
	matched,
}: {
	file: HighLevelTreeFile;
	indent: string;
	open: boolean;
	onToggle: () => void;
	glob: string | undefined;
	matched: boolean;
}) {
	const closedByGlob = !open && glob !== undefined;
	const { ref, toggle } = useStuckHeaderToggle(open, onToggle);
	return (
		<Box
			ref={ref}
			onClick={toggle}
			data-matched={matched || undefined}
			sx={highLevelTreeFileRowSx(open, matched)}
		>
			<Box
				component="button"
				type="button"
				aria-expanded={open}
				aria-label={`${open ? "Collapse" : "Expand"} ${file.path}`}
				sx={highLevelTreeFileButtonSx(indent)}
			>
				<HighLevelTreeFileChevron open={open} />
				<HighLevelTreeFileLabel file={file} muted={closedByGlob} />
				<HighLevelTreeFileTags
					file={file}
					ignoredBy={closedByGlob ? glob : undefined}
				/>
				<HighLevelLineCounts
					additions={file.additions}
					deletions={file.deletions}
					inline
				/>
			</Box>
			<HighLevelTreeSliceTags slices={file.slices} />
			<HighLevelTreeFileLink file={file} />
		</Box>
	);
}
