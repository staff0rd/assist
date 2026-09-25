import Box from "@mui/material/Box";
import { DiffFileTreeDirRow } from "./DiffFileTreeRows/DiffFileTreeDirRow";
import { DiffFileTreeFileRow } from "./DiffFileTreeRows/DiffFileTreeFileRow";
import { DIFF_TREE_INDENT } from "./diffFileTreeRowSx";
import type { DiffFileTreeRowsProps } from "./DiffFileTreeRows/DiffFileTreeRowsProps";
import { treeFileKeys } from "../../treeFileKeys";

export function DiffFileTreeRows(props: DiffFileTreeRowsProps) {
	const { nodes, depth, collapsed, activeFile, onSelectFile, onRevert } = props;
	const indent = `${depth * DIFF_TREE_INDENT}px`;

	return nodes.map((node) =>
		node.kind === "file" ? (
			<DiffFileTreeFileRow
				key={node.path}
				file={node}
				indent={indent}
				active={node.fileKey === activeFile}
				onSelect={onSelectFile}
				onRevert={onRevert}
			/>
		) : (
			<Box key={node.path} sx={{ minWidth: 0 }}>
				<DiffFileTreeDirRow
					name={node.name}
					path={node.path}
					paths={treeFileKeys(node.children)}
					collapsed={collapsed.has(node.path)}
					indent={indent}
					onToggle={() => props.onToggleDir(node.path)}
					onRevertPaths={props.onRevertPaths}
				/>
				{!collapsed.has(node.path) && (
					<DiffFileTreeRows
						{...props}
						nodes={node.children}
						depth={depth + 1}
					/>
				)}
			</Box>
		),
	);
}
