import { Box } from "@mui/material";
import type {
	HighLevelSlice,
	HighLevelStructure,
	HighLevelTestFile,
} from "../../../../../../../review/highLevel/types";
import type { HighLevelDiffComments } from "../HighLevelDiffComments";
import { HighLevelStructureView } from "../HighLevelStructureView";
import { highLevelSliceDomId } from "../highLevelSliceDomId";
import { HighLevelSliceHeader } from "./HighLevelSliceHeader";
import { HighLevelSliceTests } from "./HighLevelSliceTests";

export function HighLevelSliceSection({
	number,
	slice,
	structure,
	tests,
	collapsedPaths,
	subject,
	comments,
}: {
	number: number;
	slice: HighLevelSlice;
	structure: HighLevelStructure;
	tests: HighLevelTestFile[];
	collapsedPaths: string[];
	subject: string;
	comments?: HighLevelDiffComments | undefined;
}) {
	const sliceSubject = `${subject}:slice:${number}`;
	return (
		<Box
			component="section"
			id={highLevelSliceDomId(number)}
			aria-label={`Slice ${number}: ${slice.title}`}
			sx={{
				borderTop: 1,
				borderColor: "divider",
				pt: 1.25,
				display: "flex",
				flexDirection: "column",
				gap: 0.5,
				minWidth: 0,
			}}
		>
			<HighLevelSliceHeader number={number} slice={slice} />
			{structure.tree.length > 0 && (
				<HighLevelStructureView
					structure={structure}
					collapsedPaths={collapsedPaths}
					subject={sliceSubject}
					comments={comments}
					hideSummary
				/>
			)}
			<HighLevelSliceTests
				number={number}
				files={tests}
				subject={sliceSubject}
				comments={comments}
			/>
		</Box>
	);
}
