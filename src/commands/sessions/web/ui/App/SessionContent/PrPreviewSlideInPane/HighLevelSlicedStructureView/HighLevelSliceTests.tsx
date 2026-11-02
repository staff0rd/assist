import { Box, Typography } from "@mui/material";
import { highLevelTestCount } from "../../../../../../../review/highLevel/highLevelTestCount";
import type { HighLevelTestFile } from "../../../../../../../review/highLevel/types";
import type { HighLevelDiffComments } from "../HighLevelDiffComments";
import { HighLevelDiffNote } from "../HighLevelDiffNote";
import { HighLevelTestsView } from "../HighLevelTestsView";
import { highLevelTestChangeSummary } from "../HighLevelTestsView/highLevelTestChangeSummary";
import { highLevelSliceDomId } from "../highLevelSliceDomId";

export function HighLevelSliceTests({
	number,
	files,
	subject,
	comments,
}: {
	number: number;
	files: HighLevelTestFile[];
	subject: string;
	comments?: HighLevelDiffComments | undefined;
}) {
	return (
		<Box
			id={`${highLevelSliceDomId(number)}-tests`}
			aria-label={`Slice ${number} tests`}
			role="group"
			sx={{ mt: 0.5, minWidth: 0 }}
		>
			<Typography
				variant="overline"
				component="div"
				sx={{ color: "text.secondary", lineHeight: 2 }}
			>
				Tests {highLevelTestCount(files)}
				{files.length > 0 && (
					<Box
						component="span"
						sx={{ ml: 1, textTransform: "none", letterSpacing: 0 }}
					>
						{highLevelTestChangeSummary(files)}
					</Box>
				)}
			</Typography>
			{files.length === 0 ? (
				<HighLevelDiffNote>No changed tests in this slice.</HighLevelDiffNote>
			) : (
				<HighLevelTestsView
					files={files}
					testPaths={[]}
					subject={subject}
					comments={comments}
					hideSummary
				/>
			)}
		</Box>
	);
}
