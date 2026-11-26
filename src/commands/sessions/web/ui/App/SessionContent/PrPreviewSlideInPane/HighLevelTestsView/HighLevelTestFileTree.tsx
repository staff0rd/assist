import { Box } from "@mui/material";
import type { HighLevelTestFile } from "../../../../../../../review/highLevel/types";
import { HighLevelCriticalDiffHeader } from "../HighLevelCriticalDiffHeader";
import type { HighLevelDiffComments } from "../HighLevelDiffComments";
import { highLevelDiffFileSx } from "../highLevelDiffFileSx";
import { HighLevelTestNodes } from "./HighLevelTestNodes";

export function HighLevelTestFileTree({
	file,
	collapsed,
	onToggle,
	comments,
}: {
	file: HighLevelTestFile;
	collapsed: boolean;
	onToggle: () => void;
	comments?: HighLevelDiffComments | undefined;
}) {
	return (
		<Box sx={highLevelDiffFileSx}>
			<HighLevelCriticalDiffHeader
				diff={file}
				collapsed={collapsed}
				onToggle={onToggle}
			/>
			{!collapsed && (
				<HighLevelTestNodes
					nodes={file.tests}
					path={file.path}
					depth={1}
					comments={comments}
				/>
			)}
		</Box>
	);
}
