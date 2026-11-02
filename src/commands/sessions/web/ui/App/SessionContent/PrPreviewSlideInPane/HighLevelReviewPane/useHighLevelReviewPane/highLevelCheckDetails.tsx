import type { ReactNode } from "react";
import type { HighLevelPreviewPayload } from "../../../../../../../../review/highLevel/types";
import type { HighLevelDiffComments } from "../../HighLevelDiffComments";
import { HighLevelManualTesting } from "../../HighLevelManualTesting";
import { HighLevelCheckDetail } from "./highLevelCheckDetails/HighLevelCheckDetail";
import { HighLevelCriticalDiffs } from "./highLevelCheckDetails/HighLevelCriticalDiffs";
import { HighLevelStructureDetail } from "./highLevelCheckDetails/HighLevelStructureDetail";
import { HighLevelTestsDetail } from "./highLevelCheckDetails/HighLevelTestsDetail";

export function highLevelCheckDetails(
	payload: HighLevelPreviewPayload,
	comments?: HighLevelDiffComments,
): Record<string, ReactNode> {
	const subject = `${payload.repo}#${payload.prNumber}`;
	return {
		"structure-sensible": (
			<HighLevelStructureDetail
				payload={payload}
				subject={subject}
				comments={comments}
			/>
		),
		"critical-diffs-correct": (
			<HighLevelCheckDetail
				label={`Critical diffs (${payload.criticalDiffs.length})`}
			>
				<HighLevelCriticalDiffs
					diffs={payload.criticalDiffs}
					criticalPaths={payload.criticalPaths}
					slices={payload.slices}
					subject={subject}
					comments={comments}
				/>
			</HighLevelCheckDetail>
		),
		"tests-worth-having": (
			<HighLevelTestsDetail
				payload={payload}
				subject={subject}
				comments={comments}
			/>
		),
		"manual-testing": (
			<HighLevelCheckDetail
				label={`Manual testing (${payload.manualTesting?.steps.length ?? 0} steps)`}
			>
				<HighLevelManualTesting
					manualTesting={payload.manualTesting}
					repo={payload.repo}
					headSha={payload.headSha}
				/>
			</HighLevelCheckDetail>
		),
	};
}
