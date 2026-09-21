import type {
	HighLevelTreeFile,
	HighLevelTreeNode,
} from "../../../review/highLevel/types";

export type HighLevelTreeRowsProps = {
	nodes: HighLevelTreeNode[];
	depth?: number;
	collapsed: Set<string>;
	onToggleDir: (path: string) => void;
	onOpenFile: (file: HighLevelTreeFile) => void;
};
