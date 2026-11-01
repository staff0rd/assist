import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Typography from "@mui/material/Typography";
import type { DiffFileTreeFile } from "../../../buildDiffFileTree";
import { DiffFileTreeLineCounts } from "./DiffFileTreeFileRow/DiffFileTreeLineCounts";
import { DiffFileTreeRowRevert } from "./DiffFileTreeFileRow/DiffFileTreeRowRevert";
import {
	DIFF_TREE_CHEVRON_WIDTH,
	diffFileTreeActiveRowSx,
	diffFileTreeFileRowSx,
	diffFileTreeNameSx,
	diffFileTreeRowSx,
} from "../diffFileTreeRowSx";
import { slateTreeSx } from "../slateTreeSx";
import { DiffTreeFileGlyph } from "./DiffFileTreeFileRow/DiffTreeFileGlyph";
import type { UncommittedFiles } from "../../../uncommittedFiles";

export function DiffFileTreeFileRow({
	file,
	indent,
	active,
	onSelect,
	onRevert,
	uncommittedFiles,
}: {
	file: DiffFileTreeFile;
	indent: string;
	active: boolean;
	onSelect: (fileKey: string) => void;
	onRevert?: (path: string) => void;
	uncommittedFiles?: UncommittedFiles;
}) {
	return (
		<Box
			sx={[
				diffFileTreeFileRowSx,
				active && diffFileTreeActiveRowSx,
				slateTreeSx(active),
			]}
		>
			<ButtonBase
				onClick={() => onSelect(file.fileKey)}
				aria-current={active || undefined}
				sx={{
					...diffFileTreeRowSx,
					flex: 1,
					"&:hover": { bgcolor: "transparent" },
					pl: `calc(${indent} + ${DIFF_TREE_CHEVRON_WIDTH}px)`,
				}}
			>
				<DiffTreeFileGlyph />
				<Typography component="span" sx={diffFileTreeNameSx}>
					{file.name}
				</Typography>
			</ButtonBase>
			<DiffFileTreeRowRevert
				file={file}
				onRevert={onRevert}
				uncommittedFiles={uncommittedFiles}
			/>
			<DiffFileTreeLineCounts added={file.added} removed={file.removed} />
		</Box>
	);
}
