import { Box, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import type {
	HighLevelStructure,
	HighLevelTreeFile,
} from "../../../../../../../../review/highLevel/types";
import { HighLevelDiffDialog } from "./HighLevelStructureView/HighLevelDiffDialog";
import { HighLevelTreeRows } from "./HighLevelStructureView/HighLevelTreeRows";
import { flattenHighLevelTree } from "./HighLevelStructureView/flattenHighLevelTree";
import { useHighLevelCollapse } from "./useHighLevelCollapse";

export function HighLevelStructureView({
	structure,
	subject,
}: {
	structure: HighLevelStructure;
	subject: string;
}) {
	const { collapsed, onToggle } = useHighLevelCollapse(subject);
	const [open, setOpen] = useState<HighLevelTreeFile | undefined>();
	const files = useMemo(
		() => flattenHighLevelTree(structure.tree),
		[structure.tree],
	);

	if (structure.tree.length === 0)
		return (
			<Typography variant="caption" sx={{ color: "text.secondary" }}>
				No changed files.
			</Typography>
		);

	return (
		<Box sx={{ minWidth: 0 }}>
			<Typography variant="caption" sx={{ color: "text.secondary" }}>
				{structure.added} added · {structure.removed} deleted ·{" "}
				{structure.modified} modified · +{structure.additions} −
				{structure.deletions}
			</Typography>
			<Box sx={{ mt: 0.5, maxHeight: 360, overflowY: "auto" }}>
				<HighLevelTreeRows
					nodes={structure.tree}
					collapsed={collapsed}
					onToggleDir={onToggle}
					onOpenFile={setOpen}
				/>
			</Box>
			{open && (
				<HighLevelDiffDialog
					files={files}
					file={open}
					onSelect={setOpen}
					onClose={() => setOpen(undefined)}
				/>
			)}
		</Box>
	);
}
