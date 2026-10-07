import { Box, Typography } from "@mui/material";
import type { HighLevelTestNode } from "../../../../../../../../review/highLevel/types";
import type { HighLevelTestNotes } from "./HighLevelTestsView";
import { HIGH_LEVEL_TREE_INDENT } from "./highLevelTreeRowSx";
import { HighLevelTestRow } from "./HighLevelTestNodes/HighLevelTestRow";
import { highLevelTestNameSx } from "./HighLevelTestNodes/highLevelTestNameSx";

export function HighLevelTestNodes({
	nodes,
	path,
	depth,
	notes,
}: {
	nodes: HighLevelTestNode[];
	path: string;
	depth: number;
	notes: HighLevelTestNotes;
}) {
	const indent = `${depth * HIGH_LEVEL_TREE_INDENT}px`;
	return nodes.map((node) =>
		node.kind === "it" ? (
			<HighLevelTestRow
				key={node.id}
				test={node}
				path={path}
				indent={indent}
				note={notes.note(node.id)}
				onNote={(note) => notes.onNote(node.id, note)}
			/>
		) : (
			<Box key={`${node.line}:${node.name}`} sx={{ minWidth: 0 }}>
				<Typography
					component="div"
					sx={{ ...highLevelTestNameSx, pl: indent, py: 0.15, fontWeight: 600 }}
					title={node.name}
				>
					{node.name}
				</Typography>
				<HighLevelTestNodes
					nodes={node.children}
					path={path}
					depth={depth + 1}
					notes={notes}
				/>
			</Box>
		),
	);
}
