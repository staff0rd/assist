import { useMemo } from "react";
import { highLevelChangedFileCount } from "../../../../../../../../../review/highLevel/highLevelChangedFileCount";
import type { HighLevelPreviewPayload } from "../../../../../../../../../review/highLevel/types";
import type { HighLevelDiffComments } from "../../../HighLevelDiffComments";
import { HighLevelSlicedStructureView } from "../../../HighLevelSlicedStructureView";
import { HighLevelStructureView } from "../../../HighLevelStructureView";
import { HighLevelCheckDetail } from "./HighLevelCheckDetail";

export function HighLevelStructureDetail({
	payload,
	subject,
	comments,
}: {
	payload: HighLevelPreviewPayload;
	subject: string;
	comments?: HighLevelDiffComments | undefined;
}) {
	const criticalFiles = useMemo(
		() => payload.criticalDiffs.map((diff) => diff.path),
		[payload.criticalDiffs],
	);
	return (
		<HighLevelCheckDetail
			label={`Changed files (${highLevelChangedFileCount(payload.structure)})`}
		>
			{payload.slices ? (
				<HighLevelSlicedStructureView
					structure={payload.structure}
					slices={payload.slices}
					tests={payload.tests}
					criticalFiles={criticalFiles}
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
	);
}
