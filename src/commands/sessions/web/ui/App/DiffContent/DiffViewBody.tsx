import Box from "@mui/material/Box";
import {
	DiffFileList,
	type DiffFileListProps,
} from "./DiffViewBody/DiffFileList";
import { DiffFileTree } from "./DiffViewBody/DiffFileTree";
import { scrollToDiffFile } from "./DiffViewBody/scrollToDiffFile";
import type { UncommittedFiles } from "./uncommittedFiles";

const columnsSx = { display: "flex", alignItems: "flex-start" } as const;

export type DiffViewBodyProps = DiffFileListProps & {
	treeVisible: boolean;
	activeFile?: string;
	onRevert?: (path: string) => void;
	onRevertPaths?: (paths: string[]) => void;
	uncommittedFiles?: UncommittedFiles;
};

export function DiffViewBody({
	treeVisible,
	activeFile,
	onRevert,
	onRevertPaths,
	uncommittedFiles,
	...list
}: DiffViewBodyProps) {
	const onSelectFile = (fileKey: string) => {
		if (list.isCollapsed(fileKey)) list.onToggleCollapsed(fileKey);
		scrollToDiffFile(fileKey);
	};

	return (
		<Box sx={columnsSx}>
			{treeVisible && (
				<DiffFileTree
					files={list.files}
					activeFile={activeFile}
					onSelectFile={onSelectFile}
					onRevert={onRevert}
					onRevertPaths={onRevertPaths}
					uncommittedFiles={uncommittedFiles}
				/>
			)}
			<Box sx={{ flex: 1, minWidth: 0 }}>
				<DiffFileList {...list} />
			</Box>
		</Box>
	);
}
