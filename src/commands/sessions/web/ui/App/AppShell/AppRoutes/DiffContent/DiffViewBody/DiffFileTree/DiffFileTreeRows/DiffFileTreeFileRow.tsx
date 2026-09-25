import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Typography from "@mui/material/Typography";
import type { DiffFileTreeFile } from "../../../buildDiffFileTree";
import { DiffFileRevertButton } from "./DiffFileTreeFileRow/DiffFileRevertButton";
import { DiffFileTreeLineCounts } from "./DiffFileTreeFileRow/DiffFileTreeLineCounts";
import {
	DIFF_TREE_CHEVRON_WIDTH,
	diffFileTreeActiveRowSx,
	diffFileTreeFileRowSx,
	diffFileTreeNameSx,
	diffFileTreeRevertSx,
	diffFileTreeRowSx,
} from "../diffFileTreeRowSx";
import { FileTypeIcon } from "../../../../../FileTypeIcon";

export function DiffFileTreeFileRow({
	file,
	indent,
	active,
	onSelect,
	onRevert,
}: {
	file: DiffFileTreeFile;
	indent: string;
	active: boolean;
	onSelect: (fileKey: string) => void;
	onRevert?: (path: string) => void;
}) {
	return (
		<Box
			sx={{
				...diffFileTreeFileRowSx,
				...(active ? diffFileTreeActiveRowSx : {}),
			}}
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
				<FileTypeIcon path={file.fileKey} />
				<Typography component="span" sx={diffFileTreeNameSx}>
					{file.name}
				</Typography>
			</ButtonBase>
			{onRevert && (
				<Box className="diff-tree-revert" sx={diffFileTreeRevertSx}>
					<DiffFileRevertButton
						path={file.fileKey}
						added={file.isNew}
						onRevert={onRevert}
					/>
				</Box>
			)}
			<DiffFileTreeLineCounts added={file.added} removed={file.removed} />
		</Box>
	);
}
