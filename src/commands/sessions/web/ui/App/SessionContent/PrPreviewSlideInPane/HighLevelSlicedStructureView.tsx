import { Box, Typography } from "@mui/material";
import type {
	HighLevelSlice,
	HighLevelStructure,
	HighLevelTestFile,
} from "../../../../../../review/highLevel/types";
import type { HighLevelDiffComments } from "./HighLevelDiffComments";
import { HighLevelSliceSection } from "./HighLevelSlicedStructureView/HighLevelSliceSection";
import { useSlicedHighLevelReview } from "./HighLevelSlicedStructureView/useSlicedHighLevelReview";
import { HighLevelStructureSummary } from "./HighLevelStructureView/HighLevelStructureSummary";

export function HighLevelSlicedStructureView({
	structure,
	slices,
	tests,
	collapsedPaths,
	subject,
	comments,
}: {
	structure: HighLevelStructure;
	slices: HighLevelSlice[];
	tests: HighLevelTestFile[];
	collapsedPaths: string[];
	subject: string;
	comments?: HighLevelDiffComments | undefined;
}) {
	const sliced = useSlicedHighLevelReview(structure, slices, tests);
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
					structure={sliced.structures[index] ?? structure}
					tests={sliced.tests[index] ?? []}
					collapsedPaths={collapsedPaths}
					subject={subject}
					comments={comments}
				/>
			))}
		</Box>
	);
}
