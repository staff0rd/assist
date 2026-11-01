import Box from "@mui/material/Box";
import { diffFileTreeRevertSx } from "../../diffFileTreeRowSx";
import { DiffFolderRevertButton } from "./DiffFolderRevertButton";

export function DiffFileTreeDirRowRevert({
	path,
	paths,
	uncommittedOnly,
	onRevertPaths,
}: {
	path: string;
	paths: string[];
	uncommittedOnly?: boolean;
	onRevertPaths?: (paths: string[]) => void;
}) {
	if (!onRevertPaths || paths.length === 0) return null;
	return (
		<Box className="diff-tree-revert" sx={diffFileTreeRevertSx}>
			<DiffFolderRevertButton
				path={path}
				paths={paths}
				uncommittedOnly={uncommittedOnly}
				onRevert={onRevertPaths}
			/>
		</Box>
	);
}
