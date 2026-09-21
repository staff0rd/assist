import FolderIcon from "@mui/icons-material/Folder";
import { Box, Typography } from "@mui/material";
import type { HighLevelTreeNode } from "../../../review/highLevel/types";
import { HighLevelLineCounts } from "./HighLevelLineCounts";
import { HighLevelTreeFileRow } from "./HighLevelTreeFileRow";
import {
	HIGH_LEVEL_TREE_INDENT,
	highLevelTreeNameSx,
	highLevelTreeRowSx,
} from "./highLevelTreeRowSx";

export function HighLevelTreeRows({
	nodes,
	depth = 0,
}: {
	nodes: HighLevelTreeNode[];
	depth?: number;
}) {
	const indent = `${depth * HIGH_LEVEL_TREE_INDENT}px`;

	return nodes.map((node) =>
		node.kind === "file" ? (
			<HighLevelTreeFileRow key={node.path} file={node} indent={indent} />
		) : (
			<Box key={node.path} sx={{ minWidth: 0 }}>
				<Box sx={{ ...highLevelTreeRowSx, pl: indent }}>
					<FolderIcon sx={{ fontSize: 13, color: "text.secondary" }} />
					<Typography
						component="span"
						sx={{ ...highLevelTreeNameSx, fontWeight: 600 }}
						title={node.path}
					>
						{node.name}
					</Typography>
					<HighLevelLineCounts
						additions={node.additions}
						deletions={node.deletions}
					/>
				</Box>
				<HighLevelTreeRows nodes={node.children} depth={depth + 1} />
			</Box>
		),
	);
}
