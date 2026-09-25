import type { ReactNode } from "react";
import type { HighLevelPreviewPayload } from "../../../../../../../review/highLevel/types";
import { HighLevelCheckDetail } from "./highLevelCheckDetails/HighLevelCheckDetail";
import { HighLevelCriticalDiffs } from "./highLevelCheckDetails/HighLevelCriticalDiffs";
import { HighLevelStructureView } from "./highLevelCheckDetails/HighLevelStructureView";
import { highLevelChangedFileCount } from "../../../../../../../review/highLevel/highLevelChangedFileCount";

export function highLevelCheckDetails(
	payload: HighLevelPreviewPayload,
): Record<string, ReactNode> {
	return {
		"structure-sensible": (
			<HighLevelCheckDetail
				label={`Changed files (${highLevelChangedFileCount(payload.structure)})`}
			>
				<HighLevelStructureView
					structure={payload.structure}
					subject={`${payload.repo}#${payload.prNumber}`}
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
				/>
			</HighLevelCheckDetail>
		),
	};
}
