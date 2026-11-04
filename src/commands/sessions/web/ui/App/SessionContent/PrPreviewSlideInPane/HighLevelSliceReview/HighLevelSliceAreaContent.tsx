import type { HighLevelPreviewPayload } from "../../../../../../../review/highLevel/types";
import type { HighLevelDiffComments } from "../HighLevelDiffComments";
import { HighLevelCriticalDiffs } from "../HighLevelReviewPane/useHighLevelReviewPane/highLevelCheckDetails/HighLevelCriticalDiffs";
import { HighLevelStructureView } from "../HighLevelStructureView";
import type { HighLevelArea } from "./highLevelAreaCheck";
import type { HighLevelSliceView } from "./highLevelSliceViews";
import { HighLevelSliceTests } from "./HighLevelSliceTests";

export function HighLevelSliceAreaContent({
	area,
	view,
	payload,
	subject,
	comments,
}: {
	area: HighLevelArea;
	view: HighLevelSliceView;
	payload: HighLevelPreviewPayload;
	subject: string;
	comments?: HighLevelDiffComments | undefined;
}) {
	if (area === "structure")
		return (
			<HighLevelStructureView
				structure={view.structure}
				collapsedPaths={payload.collapsedPaths}
				subject={subject}
				comments={comments}
			/>
		);
	if (area === "tests")
		return (
			<HighLevelSliceTests
				number={view.number}
				files={view.tests}
				subject={subject}
				comments={comments}
			/>
		);
	return (
		<HighLevelCriticalDiffs
			diffs={view.critical}
			criticalPaths={payload.criticalPaths}
			subject={subject}
			comments={comments}
		/>
	);
}
