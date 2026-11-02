import { Box } from "@mui/material";
import { useMemo } from "react";
import { highLevelSlicesByPath } from "../../../../../../../../../../review/highLevel/highLevelSlicesByPath";
import type {
	HighLevelCriticalDiff,
	HighLevelSlice,
} from "../../../../../../../../../../review/highLevel/types";
import { useDiffViewType } from "../../../../../../useDiffViewType";
import type { HighLevelDiffComments } from "../../../../HighLevelDiffComments";
import { HighLevelCriticalDiffItem } from "./HighLevelCriticalDiffItem";
import { HighLevelCriticalToolbar } from "./HighLevelCriticalToolbar";
import { useHighLevelCriticalCollapse } from "./useHighLevelCriticalCollapse";

export function HighLevelCriticalDiffList({
	diffs,
	subject,
	comments,
	slices,
}: {
	diffs: HighLevelCriticalDiff[];
	subject: string;
	comments?: HighLevelDiffComments | undefined;
	slices?: HighLevelSlice[] | undefined;
}) {
	const { viewType, onChange } = useDiffViewType();
	const { collapsed, onToggle, bulk } = useHighLevelCriticalCollapse(
		subject,
		diffs,
	);
	const slicesByPath = useMemo(
		() => slices && highLevelSlicesByPath(slices),
		[slices],
	);
	return (
		<Box sx={{ minWidth: 0 }}>
			<HighLevelCriticalToolbar
				bulk={bulk}
				viewType={viewType}
				onChangeViewType={onChange}
			/>
			{diffs.map((diff) => (
				<HighLevelCriticalDiffItem
					key={diff.path}
					diff={diff}
					collapsed={collapsed.has(diff.path)}
					onToggle={() => onToggle(diff.path)}
					viewType={viewType}
					comments={comments}
					slices={slicesByPath?.get(diff.path)}
				/>
			))}
		</Box>
	);
}
