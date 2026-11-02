import { Box, Typography } from "@mui/material";
import { useMemo } from "react";
import { sliceHighLevelStructure } from "../../../../../../review/highLevel/sliceHighLevelStructure";
import type {
	HighLevelSlice,
	HighLevelStructure,
} from "../../../../../../review/highLevel/types";
import type { HighLevelDiffComments } from "./HighLevelDiffComments";
import { HighLevelSliceSection } from "./HighLevelSlicedStructureView/HighLevelSliceSection";
import { HighLevelStructureSummary } from "./HighLevelStructureView/HighLevelStructureSummary";

export function HighLevelSlicedStructureView({
	structure,
	slices,
	collapsedPaths,
	subject,
	comments,
}: {
	structure: HighLevelStructure;
	slices: HighLevelSlice[];
	collapsedPaths: string[];
	subject: string;
	comments?: HighLevelDiffComments | undefined;
}) {
	const sliced = useMemo(
		() => slices.map((slice) => sliceHighLevelStructure(structure, slice)),
		[structure, slices],
	);
	return (
		<Box sx={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
			<Typography variant="caption" sx={{ color: "text.secondary" }}>
				{slices.length} {slices.length === 1 ? "slice" : "slices"} ·{" "}
				<HighLevelStructureSummary structure={structure} />
			</Typography>
			{slices.map((slice, index) => (
				<HighLevelSliceSection
					key={`${index}:${slice.title}`}
					number={index + 1}
					slice={slice}
					structure={sliced[index] ?? structure}
					collapsedPaths={collapsedPaths}
					subject={subject}
					comments={comments}
				/>
			))}
		</Box>
	);
}
