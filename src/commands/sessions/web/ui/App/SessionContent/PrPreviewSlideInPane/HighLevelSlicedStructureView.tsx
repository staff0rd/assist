import { Box } from "@mui/material";
import type {
	HighLevelSlice,
	HighLevelStructure,
	HighLevelTestFile,
} from "../../../../../../review/highLevel/types";
import type { HighLevelDiffComments } from "./HighLevelDiffComments";
import { HighLevelSliceBar } from "./HighLevelSlicedStructureView/HighLevelSliceBar";
import { HighLevelSliceCount } from "./HighLevelSlicedStructureView/HighLevelSliceCount";
import { HighLevelSliceSections } from "./HighLevelSlicedStructureView/HighLevelSliceSections";
import { useSlicedStructureView } from "./HighLevelSlicedStructureView/useSlicedStructureView";
import { HighLevelStructureView } from "./HighLevelStructureView";

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
	const { selection, sections, offsetSx, toolbar } =
		useSlicedStructureView(props);
	const all = selection.selected === null;
	const bar = <HighLevelSliceBar slices={props.slices} {...selection} />;
	const shared = { subject: props.subject, comments };

	return (
		<Box
			sx={{
				minWidth: 0,
				display: "flex",
				flexDirection: "column",
				gap: 2,
				...(all ? {} : offsetSx),
			}}
		>
			<HighLevelSliceCount
				count={props.slices.length}
				structure={props.structure}
			/>
			{all ? (
				<HighLevelStructureView
					{...shared}
					structure={props.structure}
					collapsedPaths={props.collapsedPaths}
					hideSummary
					toolbarChildren={bar}
				/>
			) : (
				<HighLevelSliceSections
					{...shared}
					toolbar={toolbar}
					sections={sections}
					bar={bar}
				/>
			)}
		</Box>
	);
}
