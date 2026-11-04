import type { HighLevelCriticalDiff } from "../../../../../../../../../review/highLevel/types";
import type { HighLevelDiffComments } from "../../../HighLevelDiffComments";
import { HighLevelDiffNote } from "../../../HighLevelDiffNote";
import { HighLevelCriticalDiffList } from "./HighLevelCriticalDiffs/HighLevelCriticalDiffList";

export function HighLevelCriticalDiffs({
	criticalPaths,
	...list
}: {
	diffs: HighLevelCriticalDiff[];
	criticalPaths: string[];
	subject: string;
	comments?: HighLevelDiffComments | undefined;
}) {
	if (criticalPaths.length === 0)
		return (
			<HighLevelDiffNote>
				review.highLevel.criticalPaths is empty, so no diffs are shown here.
			</HighLevelDiffNote>
		);
	if (list.diffs.length === 0)
		return (
			<HighLevelDiffNote>{`No changed file matches ${criticalPaths.join(", ")}.`}</HighLevelDiffNote>
		);
	return <HighLevelCriticalDiffList {...list} />;
}
