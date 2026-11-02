import { Box, Typography } from "@mui/material";
import type { HighLevelTestFile } from "../../../../../../review/highLevel/types";
import { HighLevelCriticalDiffHeader } from "./HighLevelCriticalDiffHeader";
import type { HighLevelDiffComments } from "./HighLevelDiffComments";
import { highLevelDiffFileSx } from "./highLevelDiffFileSx";
import { HighLevelDiffNote } from "./HighLevelDiffNote";
import { HighLevelTestNodes } from "./HighLevelTestsView/HighLevelTestNodes";
import { highLevelTestChangeSummary } from "./HighLevelTestsView/highLevelTestChangeSummary";
import { useHighLevelCollapse } from "./useHighLevelCollapse";

export function HighLevelTestsView({
	files,
	testPaths,
	subject,
	comments,
	hideSummary = false,
}: {
	files: HighLevelTestFile[];
	testPaths: string[];
	subject: string;
	comments?: HighLevelDiffComments | undefined;
	hideSummary?: boolean;
}) {
	const { collapsed, onToggle } = useHighLevelCollapse(`tests:${subject}`);

	if (files.length === 0)
		return (
			<HighLevelDiffNote>{`No changed test in files matching ${testPaths.join(", ")}.`}</HighLevelDiffNote>
		);
	return (
		<Box sx={{ minWidth: 0 }}>
			{!hideSummary && (
				<Typography
					variant="caption"
					component="div"
					sx={{ color: "text.secondary", mb: 0.5 }}
				>
					{highLevelTestChangeSummary(files)}
				</Typography>
			)}
			{files.map((file) => (
				<Box key={file.path} sx={highLevelDiffFileSx}>
					<HighLevelCriticalDiffHeader
						diff={file}
						collapsed={collapsed.has(file.path)}
						onToggle={() => onToggle(file.path)}
					/>
					{!collapsed.has(file.path) && (
						<HighLevelTestNodes
							nodes={file.tests}
							path={file.path}
							depth={1}
							comments={comments}
						/>
					)}
				</Box>
			))}
		</Box>
	);
}
