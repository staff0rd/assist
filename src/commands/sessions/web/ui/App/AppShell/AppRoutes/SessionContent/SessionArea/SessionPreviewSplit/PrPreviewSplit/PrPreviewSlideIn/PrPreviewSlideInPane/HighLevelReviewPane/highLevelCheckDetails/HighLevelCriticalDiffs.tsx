import { Box } from "@mui/material";
import type { HighLevelCriticalDiff } from "../../../../../../../../../../../../../../review/highLevel/types";
import { DiffViewTypeToggle } from "../../../../../../../../DiffViewTypeToggle";
import { HighLevelCriticalDiffHeader } from "./HighLevelCriticalDiffs/HighLevelCriticalDiffHeader";
import { HighLevelDiffNote } from "./HighLevelDiffNote";
import { HighLevelNativeDiff } from "./HighLevelNativeDiff";
import { useDiffViewType } from "../../../../../../../../useDiffViewType";

export function HighLevelCriticalDiffs({
	diffs,
	criticalPaths,
}: {
	diffs: HighLevelCriticalDiff[];
	criticalPaths: string[];
}) {
	const { viewType, onChange } = useDiffViewType();

	if (criticalPaths.length === 0)
		return (
			<HighLevelDiffNote>
				review.highLevel.criticalPaths is unset, so no diffs are shown here.
			</HighLevelDiffNote>
		);
	if (diffs.length === 0)
		return (
			<HighLevelDiffNote>{`No changed file matches ${criticalPaths.join(", ")}.`}</HighLevelDiffNote>
		);
	return (
		<Box sx={{ minWidth: 0 }}>
			<Box sx={{ display: "flex", justifyContent: "flex-end" }}>
				<DiffViewTypeToggle viewType={viewType} onChange={onChange} />
			</Box>
			{diffs.map((diff) => (
				<Box key={diff.path} sx={{ mb: 1, minWidth: 0 }}>
					<HighLevelCriticalDiffHeader diff={diff} />
					<HighLevelNativeDiff
						path={diff.path}
						status={diff.status}
						patch={diff.patch}
						truncated={diff.truncated === true}
						viewType={viewType}
					/>
				</Box>
			))}
		</Box>
	);
}
