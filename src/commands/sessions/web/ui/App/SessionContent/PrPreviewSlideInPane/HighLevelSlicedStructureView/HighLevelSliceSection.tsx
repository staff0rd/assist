import { Box } from "@mui/material";
import type {
	HighLevelSlice,
	HighLevelStructure,
} from "../../../../../../../review/highLevel/types";
import type { HighLevelDiffComments } from "../HighLevelDiffComments";
import { HighLevelStructureView } from "../HighLevelStructureView";
import { HighLevelSliceHeader } from "./HighLevelSliceHeader";

export function HighLevelSliceSection({
	number,
	slice,
	structure,
	collapsedPaths,
	subject,
	comments,
}: {
	number: number;
	slice: HighLevelSlice;
	structure: HighLevelStructure;
	collapsedPaths: string[];
	subject: string;
	comments?: HighLevelDiffComments | undefined;
}) {
	return (
		<Box
			component="section"
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
			<HighLevelStructureView
				structure={structure}
				collapsedPaths={collapsedPaths}
				subject={`${subject}:slice:${number}`}
				comments={comments}
				hideSummary
			/>
		</Box>
	);
}
