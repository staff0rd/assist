import { Box } from "@mui/material";
import { HighLevelTreeDirRow } from "./HighLevelTreeRows/HighLevelTreeDirRow";
import { HighLevelTreeFileRow } from "./HighLevelTreeRows/HighLevelTreeFileRow";
import { HIGH_LEVEL_TREE_INDENT } from "../highLevelTreeRowSx";
import type { HighLevelTreeRowsProps } from "./HighLevelTreeRows/HighLevelTreeRowsProps";

export function HighLevelTreeRows(props: HighLevelTreeRowsProps) {
	const { nodes, depth = 0, collapsed, onToggleDir, onOpenFile } = props;
	const indent = `${depth * HIGH_LEVEL_TREE_INDENT}px`;

	return nodes.map((node) =>
		node.kind === "file" ? (
			<HighLevelTreeFileRow
				key={node.path}
				file={node}
				indent={indent}
				onOpen={() => onOpenFile(node)}
			/>
		) : (
			<Box key={node.path} sx={{ minWidth: 0 }}>
				<HighLevelTreeDirRow
					dir={node}
					collapsed={collapsed.has(node.path)}
					indent={indent}
					onToggle={() => onToggleDir(node.path)}
				/>
				{!collapsed.has(node.path) && (
					<HighLevelTreeRows
						{...props}
						nodes={node.children}
						depth={depth + 1}
					/>
				)}
			</Box>
		),
	);
}
