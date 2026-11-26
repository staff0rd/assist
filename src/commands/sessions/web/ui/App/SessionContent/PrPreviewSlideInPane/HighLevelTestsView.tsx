import { Box } from "@mui/material";
import type {
	HighLevelTestFile,
	HighLevelTestRegrouping,
} from "../../../../../../review/highLevel/types";
import type { HighLevelDiffComments } from "./HighLevelDiffComments";
import { HighLevelDiffNote } from "./HighLevelDiffNote";
import { HighLevelTestFileTree } from "./HighLevelTestsView/HighLevelTestFileTree";
import { highLevelTestChangeSummary } from "./HighLevelTestsView/highLevelTestChangeSummary";
import { HighLevelTestsToolbar } from "./HighLevelTestsView/HighLevelTestsToolbar";
import { useRegroupedTests } from "./HighLevelTestsView/useRegroupedTests";
import { useHighLevelCollapse } from "./useHighLevelCollapse";

export function HighLevelTestsView({
	files,
	testPaths,
	subject,
	comments,
	regrouping,
	groupingSubject = subject,
	hideSummary = false,
}: {
	files: HighLevelTestFile[];
	testPaths: string[];
	subject: string;
	comments?: HighLevelDiffComments | undefined;
	regrouping?: HighLevelTestRegrouping | undefined;
	groupingSubject?: string | undefined;
	hideSummary?: boolean;
}) {
	const { collapsed, onToggle } = useHighLevelCollapse(`tests:${subject}`);
	const { shown, grouping, setGrouping } = useRegroupedTests(
		files,
		regrouping,
		groupingSubject,
	);

	if (files.length === 0)
		return (
			<HighLevelDiffNote>{`No changed test in files matching ${testPaths.join(", ")}.`}</HighLevelDiffNote>
		);
	return (
		<Box sx={{ minWidth: 0 }}>
			<HighLevelTestsToolbar
				summary={hideSummary ? undefined : highLevelTestChangeSummary(files)}
				grouping={grouping}
				onGrouping={setGrouping}
			/>
			{shown.map((file) => (
				<HighLevelTestFileTree
					key={file.path}
					file={file}
					collapsed={collapsed.has(file.path)}
					onToggle={() => onToggle(file.path)}
					comments={comments}
				/>
			))}
		</Box>
	);
}
