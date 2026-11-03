import { Box, Typography } from "@mui/material";
import type { ReactNode } from "react";
import type { HighLevelStructure } from "../../../../../../review/highLevel/types";
import type { HighLevelDiffComments } from "./HighLevelDiffComments";
import { HighLevelStructureSummary } from "./HighLevelStructureView/HighLevelStructureSummary";
import { HighLevelStructureToolbar } from "./HighLevelStructureView/HighLevelStructureToolbar";
import { HighLevelStructureTree } from "./HighLevelStructureView/HighLevelStructureTree";
import { useHighLevelStructureView } from "./HighLevelStructureView/useHighLevelStructureView";

export function HighLevelStructureView({
	structure,
	collapsedPaths,
	subject,
	comments,
	hideSummary = false,
	toolbarChildren,
}: {
	structure: HighLevelStructure;
	collapsedPaths: string[];
	subject: string;
	comments?: HighLevelDiffComments | undefined;
	hideSummary?: boolean;
	toolbarChildren?: ReactNode;
}) {
	const { offsetSx, toolbar, tree } = useHighLevelStructureView(
		subject,
		structure.tree,
		collapsedPaths,
	);

	if (structure.tree.length === 0)
		return (
			<Typography variant="caption" sx={{ color: "text.secondary" }}>
				No changed files.
			</Typography>
		);

	return (
		<Box sx={{ minWidth: 0, ...offsetSx }}>
			{!hideSummary && <HighLevelStructureSummary structure={structure} />}
			<HighLevelStructureToolbar {...toolbar}>
				{toolbarChildren}
			</HighLevelStructureToolbar>
			<HighLevelStructureTree {...tree} comments={comments} />
		</Box>
	);
}
