import Box from "@mui/material/Box";
import { useMemo } from "react";
import type { FileData } from "react-diff-view";
import { buildDiffFileTree } from "../buildDiffFileTree";
import { DiffFileTreeHeader } from "./DiffFileTree/DiffFileTreeHeader";
import { DiffFileTreeRows } from "./DiffFileTree/DiffFileTreeRows";
import { slateTreePanelSx } from "./DiffFileTree/slateTreeSx";
import { DIFF_TOOLBAR_HEIGHT } from "../DiffToolbar";
import { treeFileKeys } from "../treeFileKeys";
import type { UncommittedFiles } from "../uncommittedFiles";
import { useCollapsedDirs } from "./DiffFileTree/useCollapsedDirs";
import { statusBarInset } from "../../../designSystem/statusBarInset";

const panelSx = {
	position: "sticky",
	top: `${DIFF_TOOLBAR_HEIGHT}px`,
	alignSelf: "flex-start",
	flexShrink: 0,
	width: 260,
	maxHeight: `calc(100vh - ${DIFF_TOOLBAR_HEIGHT + 96}px - ${statusBarInset})`,
	overflow: "auto",
	pt: 2,
	pr: 2,
} as const;

export function DiffFileTree({
	files,
	activeFile,
	onSelectFile,
	onRevert,
	onRevertPaths,
	uncommittedFiles,
}: {
	files: FileData[];
	activeFile?: string;
	onSelectFile: (fileKey: string) => void;
	onRevert?: (path: string) => void;
	onRevertPaths?: (paths: string[]) => void;
	uncommittedFiles?: UncommittedFiles;
}) {
	const nodes = useMemo(() => buildDiffFileTree(files), [files]);
	const { collapsed, onToggleDir } = useCollapsedDirs(activeFile);

	if (nodes.length === 0) return null;

	return (
		<Box sx={[panelSx, slateTreePanelSx]} aria-label="Changed files">
			{onRevertPaths && (
				<DiffFileTreeHeader
					paths={treeFileKeys(nodes)}
					onRevertPaths={onRevertPaths}
				/>
			)}
			<DiffFileTreeRows
				nodes={nodes}
				depth={0}
				collapsed={collapsed}
				activeFile={activeFile}
				onToggleDir={onToggleDir}
				onSelectFile={onSelectFile}
				onRevert={onRevert}
				onRevertPaths={onRevertPaths}
				uncommittedFiles={uncommittedFiles}
			/>
		</Box>
	);
}
