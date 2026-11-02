import { Box, Typography } from "@mui/material";
import type {
	HighLevelSlice,
	HighLevelStructure,
	HighLevelTestFile,
} from "../../../../../../review/highLevel/types";
import type { HighLevelDiffComments } from "./HighLevelDiffComments";
import { HighLevelSliceBar } from "./HighLevelSlicedStructureView/HighLevelSliceBar";
import { HighLevelSliceSection } from "./HighLevelSlicedStructureView/HighLevelSliceSection";
import { useSlicedStructureView } from "./HighLevelSlicedStructureView/useSlicedStructureView";
import { HighLevelStructureSummary } from "./HighLevelStructureView/HighLevelStructureSummary";
import { HighLevelStructureToolbar } from "./HighLevelStructureView/HighLevelStructureToolbar";

export function HighLevelSlicedStructureView({
	comments,
	...props
}: {
	structure: HighLevelStructure;
	slices: HighLevelSlice[];
	tests: HighLevelTestFile[];
	criticalFiles: string[];
	collapsedPaths: string[];
	subject: string;
	comments?: HighLevelDiffComments | undefined;
}) {
	const { slices, structure, subject } = props;
	const { selection, sections, offsetSx, toolbar } =
		useSlicedStructureView(props);

	return (
		<Box
			sx={{
				minWidth: 0,
				display: "flex",
				flexDirection: "column",
				gap: 2,
				...offsetSx,
			}}
		>
			<Typography variant="caption" sx={{ color: "text.secondary" }}>
				{slices.length} {slices.length === 1 ? "slice" : "slices"} ·{" "}
				<HighLevelStructureSummary structure={structure} />
			</Typography>
			<HighLevelStructureToolbar {...toolbar}>
				<HighLevelSliceBar
					slices={slices}
					selected={selection.selected}
					onSelect={selection.onSelect}
				/>
			</HighLevelStructureToolbar>
			{sections.map((section) => (
				<HighLevelSliceSection
					key={`${section.number}:${section.slice.title}`}
					{...section}
					subject={subject}
					comments={comments}
				/>
			))}
		</Box>
	);
}
