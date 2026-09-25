import type { DiffFileTreeNode } from "../../../buildDiffFileTree";

export type DiffFileTreeRowsProps = {
	nodes: DiffFileTreeNode[];
	depth: number;
	collapsed: ReadonlySet<string>;
	activeFile: string | undefined;
	onToggleDir: (path: string) => void;
	onSelectFile: (fileKey: string) => void;
	onRevert?: (path: string) => void;
	onRevertPaths?: (paths: string[]) => void;
};
