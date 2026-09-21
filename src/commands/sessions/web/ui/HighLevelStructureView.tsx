import { Box, Typography } from "@mui/material";
import type { HighLevelStructure } from "../../../review/highLevel/types";
import { HighLevelTreeRows } from "./HighLevelTreeRows";

export function HighLevelStructureView({
	structure,
}: {
	structure: HighLevelStructure;
}) {
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
				<HighLevelTreeRows nodes={structure.tree} />
			</Box>
		</Box>
	);
}
