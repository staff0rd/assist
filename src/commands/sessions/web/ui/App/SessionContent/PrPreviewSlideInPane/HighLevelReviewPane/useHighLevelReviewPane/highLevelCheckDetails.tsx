import type { ReactNode } from "react";
import type { HighLevelPreviewPayload } from "../../../../../../../../review/highLevel/types";
import type { HighLevelDiffComments } from "../../HighLevelDiffComments";
import { HighLevelCheckDetail } from "./highLevelCheckDetails/HighLevelCheckDetail";
import { HighLevelCriticalDiffs } from "./highLevelCheckDetails/HighLevelCriticalDiffs";
import { HighLevelSlicedStructureView } from "../../HighLevelSlicedStructureView";
import { HighLevelStructureView } from "../../HighLevelStructureView";
import { HighLevelTestsView } from "../../HighLevelTestsView";
import { highLevelChangedFileCount } from "../../../../../../../../review/highLevel/highLevelChangedFileCount";
import { highLevelTestCount } from "../../../../../../../../review/highLevel/highLevelTestCount";

export function highLevelCheckDetails(
	payload: HighLevelPreviewPayload,
	comments?: HighLevelDiffComments,
): Record<string, ReactNode> {
	const subject = `${payload.repo}#${payload.prNumber}`;
	return {
		"structure-sensible": (
			<HighLevelCheckDetail
				label={`Changed files (${highLevelChangedFileCount(payload.structure)})`}
			>
				{payload.slices ? (
					<HighLevelSlicedStructureView
						structure={payload.structure}
						slices={payload.slices}
						collapsedPaths={payload.collapsedPaths}
						subject={subject}
						comments={comments}
					/>
				) : (
					<HighLevelStructureView
						structure={payload.structure}
						collapsedPaths={payload.collapsedPaths}
						subject={subject}
						comments={comments}
					/>
				)}
			</HighLevelCheckDetail>
		),
		"critical-diffs-correct": (
			<HighLevelCheckDetail
				label={`Critical diffs (${payload.criticalDiffs.length})`}
			>
				<HighLevelCriticalDiffs
					diffs={payload.criticalDiffs}
					criticalPaths={payload.criticalPaths}
					subject={subject}
					comments={comments}
				/>
			</HighLevelCheckDetail>
		),
		"tests-worth-having": (
			<HighLevelCheckDetail
				label={`Changed tests (${highLevelTestCount(payload.tests)})`}
			>
				<HighLevelTestsView
					files={payload.tests}
					testPaths={payload.testPaths}
					subject={subject}
					comments={comments}
				/>
			</HighLevelCheckDetail>
		),
	};
}
