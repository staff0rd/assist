import { Box, Typography } from "@mui/material";
import type { HighLevelStructure } from "../../../../../../review/highLevel/types";
import type { HighLevelDiffComments } from "./HighLevelDiffComments";
import { HighLevelStructureToolbar } from "./HighLevelStructureView/HighLevelStructureToolbar";
import { HighLevelStructureSummary } from "./HighLevelStructureView/HighLevelStructureSummary";
import { HighLevelStructureTree } from "./HighLevelStructureView/HighLevelStructureTree";
import { useDiffViewType } from "../../useDiffViewType";
import { useHighLevelStructureCollapse } from "./HighLevelStructureView/useHighLevelStructureCollapse";
import { useHighLevelStructureMatch } from "./HighLevelStructureView/useHighLevelStructureMatch";
import { useStructureToolbarOffset } from "./HighLevelStructureView/useStructureToolbarOffset";

export function HighLevelStructureView({
	structure,
	collapsedPaths,
	subject,
	comments,
	hideSummary = false,
}: {
	structure: HighLevelStructure;
	collapsedPaths: string[];
	subject: string;
	comments?: HighLevelDiffComments | undefined;
	hideSummary?: boolean;
}) {
	const { dirs, files, fileGlobs, filePaths, bulk } =
		useHighLevelStructureCollapse(subject, structure.tree, collapsedPaths);
	const { viewType, onChange } = useDiffViewType();
	const match = useHighLevelStructureMatch(filePaths, collapsedPaths);
	const { toolbarRef, offsetSx } = useStructureToolbarOffset();

	if (structure.tree.length === 0)
		return (
			<Typography variant="caption" sx={{ color: "text.secondary" }}>
				No changed files.
			</Typography>
		);

	return (
		<Box sx={{ minWidth: 0, ...offsetSx }}>
			{!hideSummary && <HighLevelStructureSummary structure={structure} />}
			<HighLevelStructureToolbar
				ref={toolbarRef}
				bulk={bulk}
				viewType={viewType}
				onChangeViewType={onChange}
				{...match}
			/>
			<HighLevelStructureTree
				glob={match.glob}
				nodes={structure.tree}
				collapsed={dirs.collapsed}
				onToggleDir={dirs.onToggle}
				collapsedFiles={files.collapsed}
				onToggleFile={files.onToggle}
				fileGlobs={fileGlobs}
				matches={match.matches}
				viewType={viewType}
				comments={comments}
			/>
		</Box>
	);
}
