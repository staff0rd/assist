import type { DiffFileTreeNode } from "../../../buildDiffFileTree";
import type { UncommittedFiles } from "../../../uncommittedFiles";

export type DiffFileTreeRowsProps = {
	nodes: DiffFileTreeNode[];
	depth: number;
	collapsed: ReadonlySet<string>;
	activeFile: string | undefined;
	onToggleDir: (path: string) => void;
	onSelectFile: (fileKey: string) => void;
	onRevert?: (path: string) => void;
	onRevertPaths?: (paths: string[]) => void;
	uncommittedFiles?: UncommittedFiles;
};
