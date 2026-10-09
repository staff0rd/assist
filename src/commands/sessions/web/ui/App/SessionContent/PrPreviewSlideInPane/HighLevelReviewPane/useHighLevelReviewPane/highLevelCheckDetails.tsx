import type { ReactNode } from "react";
import type { HighLevelPreviewPayload } from "../../../../../../../../review/highLevel/types";
import type { HighLevelDiffComments } from "./HighLevelDiffComments";
import { HighLevelCheckDetail } from "./highLevelCheckDetails/HighLevelCheckDetail";
import { HighLevelCriticalDiffs } from "./highLevelCheckDetails/HighLevelCriticalDiffs";
import { HighLevelStructureView } from "./highLevelCheckDetails/HighLevelStructureView";
import {
	HighLevelTestsView,
	type HighLevelTestNotes,
} from "./highLevelCheckDetails/HighLevelTestsView";
import { highLevelChangedFileCount } from "../../../../../../../../review/highLevel/highLevelChangedFileCount";
import { highLevelTestCount } from "../../../../../../../../review/highLevel/highLevelTestCount";

export function highLevelCheckDetails(
	payload: HighLevelPreviewPayload,
	notes: HighLevelTestNotes,
	comments?: HighLevelDiffComments,
): Record<string, ReactNode> {
	const subject = `${payload.repo}#${payload.prNumber}`;
	return {
		"structure-sensible": (
			<HighLevelCheckDetail
				label={`Changed files (${highLevelChangedFileCount(payload.structure)})`}
			>
				<HighLevelStructureView
					structure={payload.structure}
					subject={subject}
					comments={comments}
				/>
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
					notes={notes}
				/>
			</HighLevelCheckDetail>
		),
	};
}
