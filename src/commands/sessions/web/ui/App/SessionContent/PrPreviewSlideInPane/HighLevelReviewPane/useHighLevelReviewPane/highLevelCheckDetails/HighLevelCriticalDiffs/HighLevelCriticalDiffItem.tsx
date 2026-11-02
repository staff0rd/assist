import { Box } from "@mui/material";
import type { ViewType } from "react-diff-view";
import type { HighLevelCriticalDiff } from "../../../../../../../../../../review/highLevel/types";
import { HighLevelCriticalDiffHeader } from "../../../../HighLevelCriticalDiffHeader";
import type { HighLevelDiffComments } from "../../../../HighLevelDiffComments";
import { highLevelDiffFileSx } from "../../../../highLevelDiffFileSx";
import { HighLevelNativeDiff } from "../../../../HighLevelNativeDiff";
import { HighLevelCriticalSliceTags } from "./HighLevelCriticalSliceTags";

export function HighLevelCriticalDiffItem({
	diff,
	collapsed,
	onToggle,
	viewType,
	comments,
	slices,
}: {
	diff: HighLevelCriticalDiff;
	slices?: { number: number; title: string }[] | undefined;
	collapsed: boolean;
	onToggle: () => void;
	viewType: ViewType;
	comments?: HighLevelDiffComments | undefined;
}) {
	return (
		<Box sx={highLevelDiffFileSx}>
			<HighLevelCriticalDiffHeader
				diff={diff}
				collapsed={collapsed}
				onToggle={onToggle}
			>
				{slices && <HighLevelCriticalSliceTags slices={slices} />}
			</HighLevelCriticalDiffHeader>
			{!collapsed && (
				<HighLevelNativeDiff
					path={diff.path}
					status={diff.status}
					patch={diff.patch}
					truncated={diff.truncated === true}
					viewType={viewType}
					comments={comments}
				/>
			)}
		</Box>
	);
}
