import { Box } from "@mui/material";
import type {
	HighLevelSlice,
	HighLevelStructure,
	HighLevelTestFile,
} from "../../../../../../../review/highLevel/types";
import type { HighLevelDiffComments } from "../HighLevelDiffComments";
import { HighLevelStructureTree } from "../HighLevelStructureView/HighLevelStructureTree";
import type { HighLevelTreeRowsProps } from "../HighLevelStructureView/HighLevelTreeRowsProps";
import { highLevelSliceDomId } from "../highLevelSliceDomId";
import { HighLevelSliceHeader } from "./HighLevelSliceHeader";
import { HighLevelSliceTests } from "./HighLevelSliceTests";
import { highLevelSliceSectionSx } from "./highLevelSliceSectionSx";

export function HighLevelSliceSection({
	number,
	slice,
	structure,
	tree,
	tests,
	subject,
	comments,
}: {
	number: number;
	slice: HighLevelSlice;
	structure: HighLevelStructure;
	tree: Omit<HighLevelTreeRowsProps, "nodes" | "comments"> & { glob: string };
	tests: HighLevelTestFile[];
	subject: string;
	comments?: HighLevelDiffComments | undefined;
}) {
	return (
		<Box
			component="section"
			id={highLevelSliceDomId(number)}
			aria-label={`Slice ${number}: ${slice.title}`}
			sx={highLevelSliceSectionSx}
		>
			<HighLevelSliceHeader number={number} slice={slice} />
			{structure.tree.length > 0 && (
				<HighLevelStructureTree
					{...tree}
					nodes={structure.tree}
					comments={comments}
				/>
			)}
			{(!slice.rest || tests.length > 0) && (
				<HighLevelSliceTests
					number={number}
					files={tests}
					subject={`${subject}:slice:${number}`}
					comments={comments}
				/>
			)}
		</Box>
	);
}
