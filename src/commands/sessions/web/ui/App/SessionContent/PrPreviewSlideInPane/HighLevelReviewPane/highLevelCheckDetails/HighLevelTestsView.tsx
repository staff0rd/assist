import { Box } from "@mui/material";
import type { HighLevelTestFile } from "../../../../../../../../review/highLevel/types";
import { HighLevelCriticalDiffHeader } from "./HighLevelCriticalDiffHeader";
import { HighLevelDiffNote } from "./HighLevelDiffNote";
import { HighLevelTestNodes } from "./HighLevelTestNodes";
import { useHighLevelCollapse } from "./useHighLevelCollapse";

export type HighLevelTestNotes = {
	note: (testId: string) => string;
	onNote: (testId: string, note: string) => void;
};

export function HighLevelTestsView({
	files,
	testPaths,
	subject,
	notes,
}: {
	files: HighLevelTestFile[];
	testPaths: string[];
	subject: string;
	notes: HighLevelTestNotes;
}) {
	const { collapsed, onToggle } = useHighLevelCollapse(`tests:${subject}`);

	if (files.length === 0)
		return (
			<HighLevelDiffNote>{`No changed test in files matching ${testPaths.join(", ")}.`}</HighLevelDiffNote>
		);
	return (
		<Box sx={{ minWidth: 0 }}>
			{files.map((file) => (
				<Box key={file.path} sx={{ mb: 1, minWidth: 0 }}>
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
							notes={notes}
						/>
					)}
				</Box>
			))}
		</Box>
	);
}
