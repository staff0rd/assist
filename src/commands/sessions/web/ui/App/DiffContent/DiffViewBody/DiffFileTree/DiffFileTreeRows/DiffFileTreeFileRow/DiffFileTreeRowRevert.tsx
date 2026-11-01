import Box from "@mui/material/Box";
import type { DiffFileTreeFile } from "../../../../buildDiffFileTree";
import { fileRevertState } from "../../../../fileRevertState";
import type { UncommittedFiles } from "../../../../uncommittedFiles";
import { diffFileTreeRevertSx } from "../../diffFileTreeRowSx";
import { DiffFileRevertButton } from "./DiffFileRevertButton";

export function DiffFileTreeRowRevert({
	file,
	onRevert,
	uncommittedFiles,
}: {
	file: DiffFileTreeFile;
	onRevert?: (path: string) => void;
	uncommittedFiles?: UncommittedFiles;
}) {
	const revert = onRevert && fileRevertState(file, uncommittedFiles);
	if (!onRevert || !revert) return null;
	return (
		<Box className="diff-tree-revert" sx={diffFileTreeRevertSx}>
			<DiffFileRevertButton
				path={file.fileKey}
				added={revert.added}
				uncommittedOnly={revert.uncommittedOnly}
				onRevert={onRevert}
			/>
		</Box>
	);
}
